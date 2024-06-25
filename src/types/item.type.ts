import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLID, GraphQLInputObjectType } from "graphql";
import { mealType } from "./meal.type";

export const itemType = new GraphQLObjectType({
  name: "Item",
  fields: {
    id: { type: GraphQLID },
    meal: { type: mealType },
    price: { type: GraphQLFloat },
    quantity: { type: GraphQLInt },
    note: { type: GraphQLString },
  },
});

export const itemInput = new GraphQLInputObjectType({
  name: "itemInputType",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    quantity: { type: GraphQLInt },
    price: { type: GraphQLFloat },
    total: { type: GraphQLFloat },
    note: { type: GraphQLString },
  }),
});
