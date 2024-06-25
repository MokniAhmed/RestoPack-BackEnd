import update from "crud/update";
import remove from "crud/remove";
import apiWrapper from "crud/apiWrapper";

import { GraphQLError, GraphQLID, GraphQLString, GraphQLList } from "graphql";

import { categoryType } from "types/category.type";

import { Role } from "models/user.model";
import Category, { CategoryDocument } from "./../models/category.model";
import Menu from "./../models/menu.model";

import {
  updateCategoryValidator,
  addCategoryToMenuValidator,
  deleteCategoryFromMenuValidator,
} from "../validation/category.validation";

export default {
  addCategoryToMenu: apiWrapper(
    async (args) => {
      const { categoryName, menuId } = args;
      const category: CategoryDocument = new Category({ name: categoryName });
      category.save().catch((err) => {
        throw new GraphQLError(err);
      });
      await Menu.findByIdAndUpdate(menuId, {
        $addToSet: { categories: category },
      }).catch((err) => {
        throw new GraphQLError(err);
      });

      return category;
    },
    categoryType,
    {
      categoryName: { type: GraphQLString, required: true },
      menuId: { type: GraphQLID, required: true },
    },
    {
      authorizationRoles: [Role.OWNER],
      validateSchema: addCategoryToMenuValidator,
    }
  ),

  updateCategory: update(Category, { name: GraphQLString, meals: GraphQLList(GraphQLID) }, categoryType, {
    authorizationRoles: [Role.OWNER],
    validateSchema: updateCategoryValidator,
  }),

  deleteCategory: remove(Category, {
    // authorizationRoles: [Role.OWNER],
    pre: async (args) => {
      const { id } = args;
      await Menu.findOneAndUpdate({ categories: id }, { $pull: { categories: id } });
      return args;
    },
  }),

  deleteCategoryFromMenu: apiWrapper(
    async (args) => {
      const { categoryId, menuId } = args;
      const category = await Category.findByIdAndDelete(categoryId);
      if (!category) throw new GraphQLError("category not found");
      return await Menu.findByIdAndUpdate(menuId, {
        $pull: { categories: categoryId },
      })
        .then(() => "category : " + category.name + "deleted")
        .catch((err) => err);
    },
    GraphQLString,
    {
      categoryId: { type: GraphQLID, required: true },
      menuId: { type: GraphQLID, required: true },
    },
    {
      authorizationRoles: [Role.OWNER],
      validateSchema: deleteCategoryFromMenuValidator,
    }
  ),
};
