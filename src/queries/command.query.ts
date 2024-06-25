import get from "crud/get";
import list from "crud/list";
import Command, { Status } from "models/command.model";
import { commandType } from "types/command.type";
import UserLoyalty from "models/userLoyalty.model";
import { userLoyaltyType } from "types/userLoyalty.type";
import apiWrapper from "crud/apiWrapper";
import { GraphQLBoolean, GraphQLID, GraphQLList, GraphQLString } from "graphql";
import { dateFilterEnumType, dateFilterResultType } from "types/dateFilter.type";
//@ts-ignore
import { dateFilterAggregationPipeline } from "utils/pipeBuilder";

export default {
  getCommands: list(Command, commandType, { authorizationRoles: [] }),
  getCommandById: get(Command, commandType, {
    authorizationRoles: [],
  }),
  getCommandByRestaurantId: list(Command, commandType, {
    args: {
      restaurantId: { type: GraphQLID },
      archived: { type: GraphQLBoolean },
    },
  }),

  getCommandByUserId: list(Command, commandType, {
    args: {
      referral: { type: GraphQLID },
    },
  }),

  getCommandByStatus: list(Command, commandType, {
    args: {
      restaurantId: { type: GraphQLID },
      status: { type: GraphQLString },
      archived: { type: GraphQLBoolean },
    },
  }),

  getUserLoyaltys: list(UserLoyalty, userLoyaltyType, {
    authorizationRoles: [],
  }),

  getLatestDeliveredCommandByUserId: apiWrapper(
    async (args) => {
      let { userId } = args;
      const res = await Command.findOne({ referral: userId, status: Status.DELIVERED, isFormFilled: false }, {}, { sort: { updatedAt: -1 } });
      return res;
    },
    commandType,
    {
      userId: { type: GraphQLID },
    },
    {}
  ),

  getCommandsPerDateFilter: apiWrapper(
    async (args) => {
      const { restaurantId, dateFilter } = args;

      const pipeline = dateFilterAggregationPipeline(restaurantId, dateFilter);
      const x =  await Command.aggregate(pipeline);
      var result: any = [];
     
      x.map((x) => {
        const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
        const objectId =
          timestamp +
          "xxxxxxxxxxxxxxxx"
            .replace(/[x]/g, () => {
              return Math.floor(Math.random() * 16).toString(16);
            })
            .toLowerCase();
        //@ts-ignore
        result.push({ ...x, id: objectId });
      });
      return result;
    },
    GraphQLList(dateFilterResultType),
    {
      restaurantId: { type: GraphQLID },
      dateFilter: { type: dateFilterEnumType },
    },
    {}
  ),

  getRevenuesPerDateFilter: apiWrapper(
    async (args) => {
      const { restaurantId, dateFilter } = args;
      const pipeline = dateFilterAggregationPipeline(restaurantId, dateFilter, { targetField: "finalPrice" });
      const x = await Command.aggregate(pipeline);
      var result: any = [];
     
      x.map((x) => {
        const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
        const objectId =
          timestamp +
          "xxxxxxxxxxxxxxxx"
            .replace(/[x]/g, () => {
              return Math.floor(Math.random() * 16).toString(16);
            })
            .toLowerCase();
        //@ts-ignore
        result.push({ ...x, id: objectId });
      });
      return result;
    },
    GraphQLList(dateFilterResultType),
    {
      restaurantId: { type: GraphQLID },
      dateFilter: { type: dateFilterEnumType },
    },
    {}
  ),
};
