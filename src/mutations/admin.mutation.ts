import create from "crud/create";
import remove from "crud/remove";
import update from "crud/update";

import { GraphQLError, GraphQLString } from "graphql";

import { restaurantType } from "types/restaurant.type";
import { userType } from "types/user.type";

import Restaurant, { RestaurantDocument } from "models/restaurant.model";
import User, { Role } from "models/user.model";

import { registerValidator } from "../validation/user.validation";
import { superVerifyRestaurantValidator } from "../validation/restaurant.validation";

export default {
  superAssignRole: update(
    User,
    {
      role: GraphQLString,
    },
    userType,
    {
      pre: async (args) => {
        const { role } = args;

        if (!Object.values(Role)?.includes(role)) throw new GraphQLError("Invalid Role");

        return args;
      },
      authorizationRoles: [Role.ADMIN],
    }
  ),
  superDeleteUser: remove(User, { authorizationRoles: [Role.ADMIN] }),

  superCreateActiveUser: create(
    User,
    {
      email: { type: GraphQLString, required: true },
      password: { type: GraphQLString, required: true },
      fullName: { type: GraphQLString, required: true },
    },
    userType,
    {
      // authorizationRoles: [Role.ADMIN],
      validateSchema: registerValidator,
      pre: async (args) => {
        const { email, ...rest } = args;
        if (email) {
          const existEmail = await User.findOne({ email });
          if (existEmail) throw new GraphQLError("Email existe déjà");
        }
        const isActive = true;

        return { ...rest, email, isActive };
      },
    }
  ),
  superDeleteRestaurant: remove(Restaurant, {
    authorizationRoles: [Role.ADMIN],
    pre: async (args) => {
      let { id } = args;
      Restaurant.findById(id, (err: any, restaurant: RestaurantDocument) => {
        if (err) throw new GraphQLError(err);
        let employees = restaurant.employees;
        employees.map((employeId) => User.findByIdAndUpdate(employeId, { "type.role": Role.USER, "type.restaurantId": null }));
      });

      return args;
    },
  }),

  superVerifyRestaurant: update(Restaurant, {}, restaurantType, {
    // authorizationRoles: [Role.ADMIN],
    validateSchema: superVerifyRestaurantValidator,

    pre: async (args) => {
      return { ...args, isVerified: true, isActive: true };
    },

    post: async ({ result: restaurant }) => {
      let ownerId = restaurant.employees[0];
      User.findByIdAndUpdate(ownerId, { "type.role": Role.OWNER, "type.restaurantId": restaurant.id }, (err) => {
        if (err) throw new GraphQLError(err);
      });
      return restaurant;
    },
  }),
};
