import get from "crud/get";
import list from "crud/list";
import Ingredient from "models/ingredient.model";
import { ingredientType, ingredientRestaurantType } from "types/ingredient.type";
import Meal from "models/meal.model";
import { mealType } from "types/meal.type";
import Category from "./../models/category.model";
import { categoryType } from "types/category.type";
import Menu from "./../models/menu.model";
import { menuType } from "types/menu.type";
import IngredientRestaurant from "models/ingredientRestaurant.model";
import apiWrapper from "crud/apiWrapper";
import { GraphQLID, GraphQLInt, GraphQLList } from "graphql";
import { GraphQLObjectType } from "graphql";
import { Types } from "mongoose";
import Restaurant, { RestaurantDocument } from "models/restaurant.model";

let mealSalesCountType = new GraphQLObjectType({
  name: "mealSalesCount",
  fields: {
    meal: { type: mealType },
    count: { type: GraphQLInt },
  },
});

export default {
  getIngredients: list(Ingredient, ingredientType, {
    authorizationRoles: [],
  }),
  getIngredientById: get(Ingredient, ingredientType, {
    authorizationRoles: [],
  }),
  getIngredientRestaurant: list(IngredientRestaurant, ingredientRestaurantType, { authorizationRoles: [] }),
  getIngredientRestaurantById: get(IngredientRestaurant, ingredientRestaurantType, {
    authorizationRoles: [],
  }),

  getIngredientsByRestaurantId: list(IngredientRestaurant, ingredientRestaurantType, {
    args: {
      restaurantId: { type: GraphQLID },
    },
  }),

  getMeals: list(Meal, mealType, {
    authorizationRoles: [],
  }),
  getMealById: get(Meal, mealType, {
    authorizationRoles: [],
  }),

  getMealsByRestaurantId: list(Meal, mealType, {
    args: {
      restaurantId: { type: GraphQLID },
    },
  }),

  getCategories: list(Category, categoryType, {
    authorizationRoles: [],
  }),
  getCategoryById: get(Category, categoryType, {
    authorizationRoles: [],
  }),
  getMenus: list(Menu, menuType, {
    authorizationRoles: [],
  }),

  getVisibleMenusByRestaurantId: apiWrapper(
    async (args) => {
      let { restaurantId } = args;

      const menuRestaurant = await Restaurant.findById(restaurantId)
        .populate("menu")
        .then((restaurant: any) => {
          let menus = restaurant.menu;
          return menus.filter((menu: any) => menu.visibility === true);
        });
      return await Menu.findById({ _id: menuRestaurant[0]?._id }).populate("categories", "name _id");
    },
    menuType,
    {
      restaurantId: { type: GraphQLID },
    }
  ),

  getMenuById: get(Menu, menuType, {
    authorizationRoles: [],
  }),

  getTopSoldMeals: apiWrapper(
    async (args) => {
      let { restaurantId } = args;
      let pipeline = [
        {
          $match: {
            restaurantId: Types.ObjectId(restaurantId),
          },
        },
        {
          $lookup: {
            from: "items",
            localField: "_id",
            foreignField: "meal._id",
            as: "mealItems",
          },
        },
        {
          $project: {
            _id: 0,
            meal: {
              _id: "$_id",
              name: "$name",
              price: "$price",
              ingredients: "$ingredients",
            },
            count: {
              $size: "$mealItems",
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ];

      return await Meal.aggregate(pipeline);
    },
    GraphQLList(mealSalesCountType),
    {
      restaurantId: { type: GraphQLID },
      limit: { type: GraphQLInt },
    }
  ),
};
