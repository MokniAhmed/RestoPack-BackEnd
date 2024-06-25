import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

const cloudinary = require("../utils/cloudinary")


export const ingredientType = new GraphQLObjectType({
  name: "Ingredient",
  fields: {
    name: { type: GraphQLString },
    isAvailable: { type: GraphQLBoolean },
    price: { type: GraphQLFloat },
    isSupplement: { type: GraphQLBoolean },
    id: { type: GraphQLID },
  },
});

export const ingredientRestaurantType = new GraphQLObjectType({
  name: "IngredientRestaurant",
  fields: {
    isAvailable: { type: GraphQLBoolean },
    name: { type: GraphQLString },
    id: { type: GraphQLID },
    isSupplement: { type: GraphQLBoolean },
    price: { type: GraphQLFloat },
    restaurantId: { type: GraphQLID },
    imageUrl: {
      type: GraphQLString,
      async resolve(ingredient){
        if (ingredient.imageUrl) return ingredient.imageUrl
        else return "https://toppng.com/uploads/preview/clipart-free-seaweed-clipart-draw-food-placeholder-11562968708qhzooxrjly.png"
      }
    }
  },

});
