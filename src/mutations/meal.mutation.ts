import apiWrapper from "crud/apiWrapper";
import create from "crud/create";
import update from "crud/update";
import remove from "crud/remove";

import { GraphQLError, GraphQLID, GraphQLString, GraphQLBoolean, GraphQLList, GraphQLFloat } from "graphql";

import { mealType } from "types/meal.type";

import Meal from "models/meal.model";
import Category from "./../models/category.model";

import {
  updateMealValidation,
  createMealValidation,
} from "../validation/meal.validation";

const cloudinary = require("utils/cloudinary");

export default {
  createMeal: create(
    Meal,
    {
      name: { type: GraphQLString, required: true },
      price: { type: GraphQLFloat, required: true },
      restaurantId: { type: GraphQLID, required: true },
      ingredients: {
        type: new GraphQLList(GraphQLID),
        required: false,
      },
      image: { type: GraphQLString, required: false},
      imageUrl: { type: GraphQLString, required: false}
    },

    mealType,
    {
      pre: async (args) =>{
        const { name, restaurantId, imageUrl,  ...rest } = args;
        
        if(rest.image){
          const uploadRes = await cloudinary.uploader.upload(rest.image, {folder: restaurantId})
          .catch((err:any) => {console.log(err); return err})            
          return {name, restaurantId, imageUrl: uploadRes.secure_url, ...rest};
        }
        return args;
      },
      validateSchema: createMealValidation,
      // authorizationRoles: [Role.OWNER],
    }
  ),

  updateMeal: update(Meal,
    { 
        restaurantId: GraphQLID,
        name: GraphQLString,
        price: GraphQLFloat,
        ingredients: new GraphQLList(GraphQLID),
        image: GraphQLString,
        imageUrl: GraphQLString, 
    }, 
    mealType, 
    {
      validateSchema: updateMealValidation,
      // authorizationRoles: [Role.OWNER],
      pre: async (args) =>{
        const { name, restaurantId, imageUrl,  ...rest } = args;        
        if(rest.image){
          const uploadRes = await cloudinary.uploader.upload(rest.image, {folder: restaurantId})
          .catch((err:any) => {console.log(err); return err})            
          return {name, restaurantId, imageUrl: uploadRes.secure_url, ...rest};
        }
        return args;
      },
    }
  ),

  deleteMeal: remove(Meal, {
    // authorizationRoles: [Role.OWNER],
    pre: async (args) => {
      const { id } = args;
      const meal = await Meal.findById(id);
      if (!meal) throw new GraphQLError("meal  not found");
      await Category.findOneAndUpdate({ meals: id }, { $pull: { meals: id } });
      return args;
    },
  }),

  addMealsToCategory: apiWrapper(
    async (args) => {
      const { mealIdsList, categoryId } = args;
      let category = await Category.findById(categoryId).populate({path:"meals", model:"Meal"})
      if (!category) throw new GraphQLError("Category not found");
      else
        await Promise.all(
          mealIdsList.map(async (mealId: string) => {
            let meal = await Meal.findById(mealId);           
            if (!meal) throw new GraphQLError("meal not found");
          })
        );
              
      category.meals.push(...mealIdsList);
      await category.save()
      
      category = await Category.findById(categoryId).populate({path:"meals", model:"Meal"})
      return category!.meals
    },
    GraphQLList(mealType),
    {
      mealIdsList: { type: GraphQLList(GraphQLID), required: true },
      categoryId: { type: GraphQLID, required: true },
    },
    {
      // authorizationRoles: [Role.OWNER],
      // validateSchema: addMealToCategoryValidation,
    }
  ),

  deleteMealFromCategory: apiWrapper(
    async (args) => {
      const { mealId, categoryId } = args;
      await Category.findByIdAndUpdate(
        { _id: categoryId },
        {
          $pull: { meals: mealId },
        },
      )
        .then(() => "deleted")
        .catch((err) => {
          throw new GraphQLError(err);
        });
      return "deleted";
    },
    GraphQLString,
    {
      mealId: { type: GraphQLID, required: true },
      categoryId: { type: GraphQLID, required: true },
    },
    {
      // authorizationRoles: [Role.OWNER],
      // validateSchema: deleteMealFromCategoryValidation,
    }
  ),

  changeMealAvailability: update(
    Meal,
    {
      isAvailable: GraphQLBoolean,
    },
    mealType
    // { authorizationRoles: [Role.OWNER] }
  ),
};
