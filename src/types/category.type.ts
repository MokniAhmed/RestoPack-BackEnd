import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLID,
} from "graphql";
import { mealType } from "./meal.type";

export const categoryType = new GraphQLObjectType({
  name: "Category",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    meals: { type: GraphQLList(mealType) },
  },
});
