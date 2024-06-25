import get from "crud/get";
import list from "crud/list";
import Restaurant from "models/restaurant.model";
import { restaurantType } from "types/restaurant.type";
import apiWrapper from "crud/apiWrapper";
import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLList } from "graphql";
import { GraphQLDate } from "graphql-iso-date";
import Command from "models/command.model";
import UserLoyalty from "models/userLoyalty.model";
import { Types } from "mongoose";
import { periodHandler } from "utils/datehandler";
import { GraphQLObjectType } from "graphql";
import { dateFilterEnumType, dateFilterResultType } from "types/dateFilter.type";
import { dateFilterAggregationPipeline } from "utils/pipeBuilder";

let newClientsPerMonthCountType = new GraphQLObjectType({
  name: "newClientsPerMonthCount",
  fields: {
    month: { type: GraphQLInt },
    count: { type: GraphQLInt },
  },
});

export default {
  getRestaurant: list(Restaurant, restaurantType, { authorizationRoles: [] }),
  getRestaurantById: get(Restaurant, restaurantType, { authorizationRoles: [] }),

  getStandardRestaurants: apiWrapper(
    async () => {
      return await Restaurant.find({}).sort({ bayesianEstimate: -1 }).limit(10);
    },
    GraphQLList(restaurantType),
    {},
    {}
  ),

  getRestaurantRevenueByDateRange: apiWrapper(
    async (args, request) => {
      let { restaurantId, startDate, endDate } = args;

      let pipeline = [
        {
          $match: {
            restaurantId: Types.ObjectId(restaurantId),
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$finalPrice",
            },
          },
        },
      ];

      let result = await Command.aggregate(pipeline);

      return result[0]?.revenue ? result[0].revenue : 0;
    },
    GraphQLFloat,
    {
      restaurantId: { type: GraphQLID },
      startDate: { type: GraphQLDate },
      endDate: { type: GraphQLDate },
    },
    {
      pre: (args, request) => {
        let { startDate, endDate }: { startDate: Date; endDate: Date } = periodHandler(args.startDate, args.endDate);

        return { ...args, startDate, endDate };
      },
    }
  ),

  getRestaurantCommandsCountByDateRange: apiWrapper(
    async (args, request) => {
      let { restaurantId, startDate, endDate } = args;

      return await Command.find({
        restaurantId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }).countDocuments();
    },
    GraphQLInt,
    {
      restaurantId: { type: GraphQLID },
      startDate: { type: GraphQLDate },
      endDate: { type: GraphQLDate },
    },
    {
      pre: (args, request) => {
        let { startDate, endDate }: { startDate: Date; endDate: Date } = periodHandler(args.startDate, args.endDate);
        return { ...args, startDate, endDate };
      },
    }
  ),

  getNewClientsCountByPeriod: apiWrapper(
    async (args, request) => {
      let { restaurantId, startDate, endDate } = args;

      return await UserLoyalty.find({
        restaurantId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }).countDocuments();
    },
    GraphQLInt,
    {
      restaurantId: { type: GraphQLID },
      startDate: { type: GraphQLDate },
      endDate: { type: GraphQLDate },
    },
    {
      pre: (args, request) => {
        let { startDate, endDate }: { startDate: Date; endDate: Date } = periodHandler(args.startDate, args.endDate);

        return { ...args, startDate, endDate };
      },
    }
  ),

  getRestaurantNewClientsPerDateFilter: apiWrapper(
    async (args) => {
      const { restaurantId, dateFilter } = args;
      const pipeline = dateFilterAggregationPipeline(restaurantId, dateFilter);

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
