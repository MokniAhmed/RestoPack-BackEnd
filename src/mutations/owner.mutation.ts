import apiWrapper from "crud/apiWrapper";
import create from "crud/create";
import remove from "crud/remove";

import { GraphQLError, GraphQLID, GraphQLString } from "graphql";

import { userType } from "types/user.type";
import { restaurantType } from "types/restaurant.type";

import Restaurant from "models/restaurant.model";
import User, { Role, UserDocument } from "models/user.model";

import { isRestaurantEmployee } from "utils/authHelpers";
import { assignEmployeRoleValidator, createNewEmployeeValidator } from "validation/user.validation";


export default {
  assignEmployeRole: apiWrapper(
    async (args) => {
      const { restaurantId, role, employeeId } = args;

      try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (restaurant && !restaurant.employees.includes(employeeId)) {
          restaurant.employees.push(employeeId);
        }
        let employee = await User.findById(employeeId);
        if (employee) {
          employee.type.role = role;
          employee.type.restaurantId = restaurantId;
        }

        restaurant?.save();
        employee?.save();

        return { employee };
      } catch {
        throw new GraphQLError("Error occured");
      }
    },
    userType,
    {
      employeeId: { type: GraphQLID },
      restaurantId: { type: GraphQLID },
      role: { type: GraphQLString },
    },
    {
      pre: async (args, request) => {
        const { employeeId, restaurantId, role } = args;

        let employee = await User.findById(employeeId);
        if (!employee || employee.isActive == false) throw new GraphQLError("Employee Not found");

        if (!Object.values(Role)?.includes(role) || role == Role.ADMIN) throw new GraphQLError("Invalid Role");

        if (await isRestaurantEmployee(request, restaurantId)) return { ...args, employee };
        else throw new GraphQLError("Invalid Operartion");
      },

      validateSchema: assignEmployeRoleValidator,
      authorizationRoles: [Role.OWNER],
    }
  ),

  disableRestaurant: apiWrapper(
    async (args) => {
      let { restaurantId } = args;
      return await Restaurant.findByIdAndUpdate(restaurantId, { isActive: false }, (err, restaurant) => {
        if (err) throw new GraphQLError("Erreur when disabling the restaurant ");
      })
        .select(Object.keys(restaurantType.getFields()).join(" "))
        .then((restaurant) => restaurant);
    },
    restaurantType,
    {
      restaurantId: { type: GraphQLID },
    },
    {
      authorizationRoles: [Role.OWNER, Role.ADMIN],

      pre: async (args, request) => {
        let { restaurantId } = args;
        if (await isRestaurantEmployee(request, restaurantId)) return args;
        else throw new GraphQLError("Invalid operation");
      },
    }
  ),

  enableRestaurant: apiWrapper(
    async (args) => {
      const { restaurantId } = args;
      return await Restaurant.findByIdAndUpdate(restaurantId, { isActive: true }, (err) => {
        if (err) throw new GraphQLError("Erreur when activating the restaurant ");
      })
        .select(Object.keys(restaurantType.getFields()).join(" "))
        .then((restaurant) => restaurant);
    },
    restaurantType,
    {
      restaurantId: { type: GraphQLID },
    },
    {
      authorizationRoles: [Role.OWNER, Role.ADMIN],

      pre: async (args, request) => {
        const { restaurantId } = args;
        if (await isRestaurantEmployee(request, restaurantId)) return args;
        else throw new GraphQLError("Invalid operation");
      },
    }
  ),
  createNewEmployee: create(
    User,
    {
      email: { type: GraphQLString, required: true },
      password: { type: GraphQLString, required: true },
      fullName: { type: GraphQLString, required: true },
      adress: { type: GraphQLString, required: true },
      phone: { type: GraphQLString, required: false },
      role: { type: GraphQLString, required: true },
    },
    userType,
    {
      //authorizationRoles: [Role.OWNER],
      validateSchema: createNewEmployeeValidator,
      pre: async (args, request) => {
        const { email, role, ...rest } = args;
        if (email) {
          const user: UserDocument | null = await User.findOne({ email });
          if (user) throw new GraphQLError("Email existe déjà");
        }
        const restaurantId = request.user?.type.restaurantId;
        const type = { role: role, restaurantId: restaurantId };
        const isActive = true;
        return { ...rest, email, type, isActive };
      },
      post: async ({ result: user, request }) => {
        const restaurantId = request.user?.type.restaurantId;
        const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, {
          $addToSet: { employees: user._id },
        });
        if (!restaurant) throw new GraphQLError("restaurant not found");
        return user;
      },
    }
  ),

  deleteEmployeeFromRestaurant: remove(User, {
    pre: async (args, request) => {
      const { id } = args;

      const restaurantId = request.user?.type.restaurantId;
      const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, { $pull: { employees: id } });
      if (!restaurant) throw new GraphQLError("restaurant not found");
      return args;
    },
    authorizationRoles: [Role.OWNER],
  }),
};
