import { GraphQLFloat, GraphQLInt, GraphQLObjectType, GraphQLID } from "graphql";
import { GraphQLEnumType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";

export enum Filter {
  MONTHLY = "monthly",
  WEEKLY = "weekly",
  DAILY = "daily",
  // YEARLY = "yearly",
  // PAST7DAYS = "past7days",
  // CUSTOM = "custom",
}

export const dateFilterEnumType = new GraphQLEnumType({
  name: "dateFilter",
  values: {
    MONTHLY: {
      value: "monthly",
    },
    WEEKLY: {
      value: "weekly",
    },
    DAILY: {
      value: "daily",
    },
  },
});

export const dateFilterResultType = new GraphQLObjectType({
  name: "dateFilterResult",
  fields: {
    id: { type: GraphQLID },
    result: { type: GraphQLFloat },
    fullDate: { type: GraphQLDateTime },
    groupKey: { type: GraphQLInt },
  },
});
