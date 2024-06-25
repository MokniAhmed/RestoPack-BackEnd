import apiWrapper from "crud/apiWrapper";
import update from "crud/update";

import { GraphQLError, GraphQLID, GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLString } from "graphql";
import { ObjectId } from "mongoose";

import { commandType } from "types/command.type";
import {itemInput, itemType, } from "./../types/item.type";

import Item from "models/item.model";
import Meal from "models/meal.model";
import User from "models/user.model";
import UserLoyalty from "./../models/userLoyalty.model";
import Command, {CommandDocument, Status } from "models/command.model";
import { Role } from "models/user.model";

import { updateUserLoyalty } from "utils/Loyalty";
import { calculateFinalPrice, calculateItemPrice } from "utils/pricing";
import { pubsub } from "index";


export default {
  createCommand: apiWrapper(
    async (args, request) => {
      const { items, restaurantId, type, discountPoints } = args;
      const { user } = request;
      let newItemsIds: Array<ObjectId> = [];
      let totalPrice = 0;

      if (!user) {
        throw new GraphQLError("user not found");
      }

      if (discountPoints) {
        const userLoyalty = await UserLoyalty.findOne({ userId: user!.id, restaurantId });
        if (!userLoyalty) throw new GraphQLError("userLoyalty not found");
        if (userLoyalty.points < discountPoints) throw new GraphQLError("You have less points ");
      }

      await Promise.all(
        items.map(async (item: any, key: number) => {
          const { id, quantity, note } = item;
          const meal = await Meal.findById(id);
          if (!meal) throw new GraphQLError("meal not found");
          const itemDoc = await new Item();
          itemDoc.meal = meal;
          itemDoc.quantity = quantity;
          itemDoc.note = note;
          itemDoc.price = await calculateItemPrice(meal!.price, quantity);
          totalPrice += itemDoc.price;
          return await itemDoc.save().then((newItem) => {
            newItemsIds[key] = newItem.id;
          });
        })
      );

      const command = await new Command();
      command.restaurantId = restaurantId;
      command.items = newItemsIds;
      command.totalPrice = totalPrice;
      command.type = type;
      command.referral = user!.id;
      command.discountPoints = discountPoints;

      if (discountPoints) {
        command.finalPrice = await calculateFinalPrice(restaurantId, totalPrice, discountPoints);
      } else command.finalPrice = totalPrice;

      if (user!.type.role == Role.SERVER) command.status = Status.VALID;
      return command.save().then(async (command) => {
        pubsub.publish("COMMAND_STATUS_UPDATED", { CommmandStatusUpdate: { status: command.status, restaurantId: String(command.restaurantId) } });
        await User.findByIdAndUpdate(user!.id, {
          $addToSet: { commands: command.id },
        });
        return command;
      });
    },
    commandType,
    {
      discountPoints: { type: GraphQLInt, required: false },
      restaurantId: { type: GraphQLID, required: true },
      type: { type: GraphQLString, required: true },
      items: { type: GraphQLList(itemInput), required: true },
    },
    {
      post: async ({ result }) => {
        pubsub.publish("COMMAND_CREATED", { commandCreated: result.get("createdAt"), restaurantId: result.get("restaurantId") });
        return result;
      },
    }
  ),

  addItemToCommand: apiWrapper(
    async (args) => {
      const { commandId, mealId, quantity, note } = args;
      
      const meal = await Meal.findById(mealId);
      if (!meal) throw new GraphQLError("meal not found");
      const command = await Command.findById(commandId);
      if (!command) throw new GraphQLError("command not found");
      
      const priceItem = await calculateItemPrice(meal!.price, quantity);
      const totalPriceC = command.totalPrice + priceItem;
      const finalPriceC = await calculateFinalPrice(command.restaurantId, totalPriceC, command.discountPoints);

      let item = new Item();
      item.meal = meal;
      item.quantity = quantity;
      item.note = note;
      item.price = priceItem;
      return await item.save().then(async (item) => {
        return await Command.findByIdAndUpdate(commandId, {
          totalPrice: totalPriceC,
          finalPrice: finalPriceC,
          $addToSet: { items: item.id },
        }).then((command) => command);
      });
    },
    commandType,
    {
      mealId: { type: GraphQLID, required: true },
      commandId: { type: GraphQLID, required: true },
      quantity: { type: GraphQLInt, required: true },
      note: { type: GraphQLString, required: false },
    },

    {}
  ),

  deleteItemfromCommand: apiWrapper(
    async (args) => {
      const { commandId, itemId } = args;
      const item = await Item.findByIdAndDelete(itemId);
      if (!item) throw new GraphQLError("item not found");
      const command: CommandDocument | null = await Command.findById(commandId);
      if (!command) throw new GraphQLError("command not found");

      const totalPrice = command.totalPrice - item.price;
      command.totalPrice = totalPrice;
      command.finalPrice = await calculateFinalPrice(command.restaurantId, totalPrice, command.discountPoints);
      const index = command!.items.indexOf(itemId);
      if (index == -1) throw new GraphQLError("item not found");
      command.items.splice(index, 1);
      return await command.save().then((command) => command);
    },
    commandType,
    {
      itemId: { type: GraphQLID, required: true },
      commandId: { type: GraphQLID, required: true },
    },

    {}
  ),

  updateItem: update(
    Item,
    {
      quantity: GraphQLInt,
      note: GraphQLString,
    },
    itemType,
    {
      pre: async (args) => {
        let { quantity, note, id } = args;
        const item = await Item.findById(id);
        if (!item) throw new GraphQLError("item not found");
        const price = await calculateItemPrice(item.meal.price, quantity);
        const command = await Command.findOne({ items: id });
        if (!command) throw new GraphQLError("command not found");
        const totalPrice = command.totalPrice - item.price + price;
        command.totalPrice = totalPrice;
        command.finalPrice = await calculateFinalPrice(command.restaurantId, totalPrice, command.discountPoints);
        await command.save();
        return { quantity, note, id, price };
      },
    }
  ),

  updateStatusCommand: apiWrapper(
    async (args) => {
      const { status, commandId } = args;

      if (!Object.values(Status).includes(status)) throw new GraphQLError("status not found");
      let command = await Command.findById(commandId);
      if (!command) throw new GraphQLError("command not found");
      if (command.status == Status.DELIVERED) throw new GraphQLError("this command is DELIVERED");
      if (status == Status.DELIVERED) {
        command.bonusPoints = await updateUserLoyalty(command);
      }
      command.status = status;
      return command
        .save()
        .then((command: any) => {
          if (command.status === Status.FINISHED || command.status === Status.DELIVERED)
            pubsub.publish("CLIENT_COMMAND_STATUS_UPDATED", { status: command.status, clientId: String(command.referral) });

          pubsub.publish("RESTAURANT_COMMAND_STATUS_UPDATED", {
            CommmandStatusUpdate: { status: command.status, restaurantId: String(command.restaurantId) },
          });
          return command;
        })
        .catch((err: any) => {
          throw new GraphQLError(err);
        });
    },
    commandType,
    {
      commandId: { type: GraphQLID, required: true },
      status: { type: GraphQLString, required: true },
    },
    {
      post: async ({ result }) => {
        return result;
      },
    }
  ),

  archivedCommand: update(
    Command,
    {
      archived: GraphQLBoolean,
    },
    commandType
  ),
};


