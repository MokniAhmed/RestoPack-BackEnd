import { GraphQLBoolean, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLFloat, GraphQLID } from "graphql";
import { ingredientRestaurantType } from "./ingredient.type";
import { restaurantType } from "./restaurant.type";

export const mealType = new GraphQLObjectType({
  name: "Meal",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    price: { type: GraphQLFloat },
    isAvailable: { type: GraphQLBoolean },
    restaurantId: { type: GraphQLID },
    ingredients: { type: GraphQLList(ingredientRestaurantType) },
    imageUrl: {
      type: GraphQLString,
      async resolve(meal) {
        if (meal.imageUrl) return meal.imageUrl;
        else return "https://toppng.com/uploads/preview/clipart-free-seaweed-clipart-draw-food-placeholder-11562968708qhzooxrjly.png";
      },
    },
  },
});
