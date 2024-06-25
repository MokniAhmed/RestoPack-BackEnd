import { GraphQLID, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLBoolean } from "graphql";
import { categoryType } from "./category.type";

export const menuType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: "Menu",
  fields: {
    id: { type: GraphQLID },
    saison: { type: GraphQLString },
    categories: { type: GraphQLList(categoryType) },
    visibility: { type: GraphQLBoolean },
  },
});
