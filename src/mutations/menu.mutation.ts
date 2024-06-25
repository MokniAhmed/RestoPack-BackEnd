import apiWrapper from "crud/apiWrapper";
import update from "crud/update";
import remove from "crud/remove";

import { GraphQLError, GraphQLID, GraphQLBoolean, GraphQLList, GraphQLString } from "graphql";

import { menuType } from "types/menu.type";

import { Role } from "models/user.model";
import Menu, { MenuDocument } from "./../models/menu.model";
import Restaurant from "models/restaurant.model";

export default {
  createMenu: apiWrapper(
    async (args) => {
      const { restaurantId, saison, categories } = args;
      const menu = new Menu();
      
      menu.saison = saison;
      menu.categories = categories;
      return menu.save().then(async (menu: MenuDocument) => {
        const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, {
          $addToSet: { menu: menu._id },
        });

        if (!restaurant) throw new GraphQLError("restaurant not found");
        const { saison, categories, id } = menu;

        return { saison, categories, id };
      });
    },
    menuType,
    {
      restaurantId: { type: GraphQLID, required: true },
      saison: { type: GraphQLString, required: true },
      categories: {
        type: new GraphQLList(GraphQLID),
        required: false,
      },
    },
    {
      //authorizationRoles: [Role.OWNER],
      // validateSchema: createMenuValidator,
    }
  ),
  updateMenu: update(Menu, { saison: GraphQLString, categories: GraphQLList(GraphQLID) }, menuType, {
    authorizationRoles: [Role.OWNER],
    // validateSchema: updateMenuValidator,
  }),

  changeVisibility: update(Menu, { visibility: GraphQLBoolean, restaurantId: GraphQLID }, menuType, {
     authorizationRoles: [Role.OWNER],
    // validateSchema: updateMenuValidator,
    pre: async (args) => {
      const { id, visibility, restaurantId } = args;

      if (visibility == true) {
        const restaurant = await Restaurant.findById(restaurantId).populate("menu", "visibility id");
        if (!restaurant) throw new GraphQLError("restaurant not found");
        await Promise.all(
          restaurant.menu.map(async (res: any) => {
            if (res.visibility === true) {
              return await Menu.findByIdAndUpdate(res._id, {
                visibility: false,
              });
            }
          })
        );
      }

      return { id, visibility };
    },
  }),

  removeMenu: remove(Menu, {
    //authorizationRoles: [Role.OWNER],
    pre: async (args, request) => {
      const { id } = args;
      const restaurant = await Restaurant.findOneAndUpdate(
        { menu: id },
        {
          $pull: { menu: id },
        }
      );
      if (!restaurant) {
        throw new GraphQLError("restaurant not found");
      }

      return args;
    },
  }),
};
