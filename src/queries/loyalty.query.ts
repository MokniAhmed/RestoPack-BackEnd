import UserLoyalty from "models/userLoyalty.model";
import { userLoyaltyType } from "types/userLoyalty.type";
import apiWrapper from "crud/apiWrapper";
import { GraphQLID, GraphQLInt } from "graphql";
import get from "crud/get";

export default {
  getUserLoyaltyByRestaurant: apiWrapper(
    async (args) => {
      let { userId, restaurantId } = args;
      let userLoyalty = await UserLoyalty.findOne({ userId, restaurantId });
      let points: number = userLoyalty ? userLoyalty.points : 0;
      return points;
    },
    GraphQLInt,
    {
      userId: { type: GraphQLID },
      restaurantId: { type: GraphQLID },
    }
  ),

  getUserLoyaltyById: get(UserLoyalty, userLoyaltyType, {
    authorizationRoles: [],
  }),
};
