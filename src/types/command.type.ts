import { itemType } from "./item.type";
import { GraphQLBoolean, GraphQLInt, GraphQLFloat, GraphQLString, GraphQLID, GraphQLList, GraphQLObjectType } from "graphql";
import { userType } from "./user.type";
import { GraphQLDateTime } from "graphql-iso-date";
import { restaurantType } from "./restaurant.type";

export const commandType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: "Command",
  fields: {
    restaurantId: { type: GraphQLID },
    id: { type: GraphQLID },
    totalPrice: { type: GraphQLFloat },
    finalPrice: { type: GraphQLFloat },
    status: { type: GraphQLString },
    type: { type: GraphQLString },
    items: { type: GraphQLList(itemType) },
    referral: { type: userType },
    duration: { type: GraphQLInt },
    archived: { type: GraphQLBoolean },
    createdAt: { type: GraphQLDateTime },
    bonusPoints: { type: GraphQLFloat },
    discountPoints: { type: GraphQLFloat },
  },
});

export const restaurantCommandUpdateType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: "restaurantCommandUpdate",
  fields: {
    restaurantId: { type: GraphQLID },
    status: { type: GraphQLString },
  },
});

export const clientCommandUpdateType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: "clientCommandUpdate",
  fields: {
    clientId: { type: GraphQLString },
    status: { type: GraphQLString },
  },
});
