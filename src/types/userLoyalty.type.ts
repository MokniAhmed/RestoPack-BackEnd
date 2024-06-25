import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
} from "graphql";
import { restaurantType } from "./restaurant.type";
import { userType } from "./user.type";

export const userLoyaltyType = new GraphQLObjectType({
  name: "UserLoyalty",
  fields: {
    id: { type: GraphQLID },
    restaurant: { type: restaurantType },
    user: { type: userType },
    points: { type: GraphQLInt },
    thresholdTracker: { type: GraphQLFloat },
  },
});
