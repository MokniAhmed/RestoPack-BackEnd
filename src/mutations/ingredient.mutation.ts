import apiWrapper from "crud/apiWrapper";
import create from "crud/create";
import update from "crud/update";
import remove from "crud/remove";

import { GraphQLError, GraphQLID, GraphQLString, GraphQLList, GraphQLBoolean, GraphQLFloat } from "graphql";
import { ObjectId } from "mongoose";

import { ingredientType, ingredientRestaurantType } from "./../types/ingredient.type";
import { mealType } from "types/meal.type";

import { Role } from "models/user.model";
import IngredientRestaurant from "../models/ingredientRestaurant.model";
import Ingredient from "models/ingredient.model";
import Meal, { MealDocument } from "models/meal.model";


import {
  createNewIngredientToReastaurantValidation,
  createIngredientValidation,
  updateIngredientValidation,
  addIngredientToMealValidation,
  deleteIngredientFromMealValidation,
  deleteAllIngredientFromMealValidation,
} from "../validation/ingredient.validation";

const cloudinary = require("utils/cloudinary");

function isMealAvailable(meal: MealDocument, id: ObjectId): boolean {
  let isAvailable = true;
  meal.ingredients.map((ingredient: any) => {
    if (ingredient.isAvailable == false && ingredient._id != id) {
      isAvailable = false;
    }
  });
  return isAvailable;
}

export default {
  createIngredient: create(Ingredient, { name: { type: GraphQLString, required: true } }, ingredientType, {
    validateSchema: createIngredientValidation,
    authorizationRoles: [Role.ADMIN],
  }),

  updateIngredient: update(Ingredient, { name: GraphQLString }, ingredientType, {
    validateSchema: updateIngredientValidation,
    authorizationRoles: [Role.ADMIN],
  }),

  removeIngredient: remove(Ingredient, {
    authorizationRoles: [Role.ADMIN],
  }),

  addIngredientToMeal: apiWrapper(
    async (args) => {
      const { mealId, ingredientId } = args;
      const ingredient = await IngredientRestaurant.findById(ingredientId);
      if (!ingredient) throw new GraphQLError("ingredient is not found in restaurant");

      return await Meal.findByIdAndUpdate(mealId, {
        $addToSet: { ingredients: ingredientId },
      })
        .select("_id name ")
        .then((meal) => meal)
        .catch((err) => {
          throw new GraphQLError(err);
        });
    },
    mealType,
    {
      ingredientId: { type: GraphQLID, required: true },
      mealId: { type: GraphQLID, required: true },
    },
    {
      // authorizationRoles: [Role.OWNER],
      validateSchema: addIngredientToMealValidation,
    }
  ),
  deleteIngredientFromMeal: apiWrapper(
    async (args) => {
      const { mealId, ingredientId } = args;

      return await Meal.findByIdAndUpdate(mealId, {
        $pull: { ingredients: ingredientId },
      })
        .select("_id name")
        .then((meal) => meal)
        .catch((err) => {
          throw new GraphQLError(err);
        });
    },
    mealType,
    {
      mealId: { type: GraphQLID, required: true },
      ingredientId: { type: GraphQLID, required: true },
    },
    {
      // authorizationRoles: [Role.OWNER],
      validateSchema: deleteIngredientFromMealValidation,
    }
  ),

  deleteAllIngredientFromMeal: apiWrapper(
    async (args) => {
      const { mealId } = args;

      return await Meal.findByIdAndUpdate(mealId, {
        ingredients: [],
      })
        .select("_id name price")
        .then((meal) => meal)
        .catch((err) => {
          throw new GraphQLError(err);
        });
    },
    mealType,
    {
      mealId: { type: GraphQLID, required: true },
    },
    {
      // authorizationRoles: [Role.OWNER],
      validateSchema: deleteAllIngredientFromMealValidation,
    }
  ),

  updateIngredientRestaurant: update(
    IngredientRestaurant,
    {
      name: GraphQLString,
      restaurantId: GraphQLID,
      isSupplement: GraphQLBoolean,
      price: GraphQLFloat,
      image: GraphQLString,
      imageUrl: GraphQLString,
    },
    ingredientRestaurantType,
    {
      // authorizationRoles: [Role.OWNER],
      pre: async (args) => {
        const { name, restaurantId, imageUrl, ...rest } = args;
        if (rest.image) {
          const uploadRes = await cloudinary.uploader.upload(rest.image, { folder: restaurantId }).catch((err: any) => {
            return err;
          });
          return { name, restaurantId, imageUrl: uploadRes.secure_url, ...rest };
        }
        return args;
      },
    }
  ),

  deleteIngerdientRestaurant: remove(IngredientRestaurant, {
    // authorizationRoles: [Role.OWNER],
  }),

  addIngredientToRestaurant: apiWrapper(
    async (args) => {
      const { ingredients, restaurantId } = args;
      for (let index = 0; index < ingredients.length; index++) {
        const ingredient = await Ingredient.findById(ingredients[index]).select("name");
        if (!ingredient) throw new GraphQLError("ingredient is not available");
        const ingredientRestaurant = new IngredientRestaurant();
        ingredientRestaurant.name = ingredient.name;
        ingredientRestaurant.isAvailable = true;
        ingredientRestaurant.restaurantId = restaurantId;
        ingredientRestaurant.save().catch((err: any) => {
          throw new GraphQLError(err);
        });
      }
      return "ingredient ajouter";
    },

    GraphQLString,
    {
      ingredients: { type: new GraphQLList(GraphQLID) },
      restaurantId: { type: GraphQLID, required: true },
    },
    {
      // authorizationRoles: [Role.OWNER],
    }
  ),

  addNewIngredientToRestaurant: create(
    IngredientRestaurant,
    {
      name: { type: GraphQLString, required: true },
      isAvailable: { type: GraphQLBoolean, required: false },
      restaurantId: { type: GraphQLID, required: true },
      isSupplement: { type: GraphQLBoolean, required: false },
      price: { type: GraphQLFloat, required: false },
      image: { type: GraphQLString, required: false },
      imageUrl: { type: GraphQLString, required: false },
    },
    ingredientRestaurantType,
    {
      validateSchema: createNewIngredientToReastaurantValidation,
      // authorizationRoles: [Role.ADMIN],
      pre: async (args) => {
        const { name, restaurantId, imageUrl, ...rest } = args;
        const ingredient = new Ingredient();
        ingredient.name = name;
        return ingredient
          .save()
          .then(async () => {
            if (rest.image) {
              const uploadRes = await cloudinary.uploader.upload(rest.image, { folder: restaurantId }).catch((err: any) => err );
              return { name, restaurantId, imageUrl: uploadRes.secure_url, ...rest };
            }
            return args;
          })
          .catch((err: any) => {
            throw new GraphQLError(err);
          });
      },
    }
  ),

  changeIngredientAvailability: update(
    IngredientRestaurant,
    {
      isAvailable: GraphQLBoolean,
    },
    ingredientRestaurantType,
    {
      pre: async (args) => {
        const { id, isAvailable } = args;
        const ingredient = await IngredientRestaurant.findById(id);
        if (!ingredient) throw new GraphQLError("ingredient not found");
        if (ingredient.isAvailable == isAvailable) throw new GraphQLError("no change");
        if (isAvailable == false) {
          await Meal.updateMany({ ingredients: id }, { isAvailable: isAvailable })
        } else {
          let meals = await Meal.find({ ingredients: id }).select(" isAvailable").populate("ingredients", "isAvailable");

          await Promise.all(
            meals.map(async (meal) => {
              if (isMealAvailable(meal, id)) {
                meal.isAvailable = isAvailable;
                await meal.save();
              }
            })
          );
        }
        return args;
      },
    }
  ),
};
