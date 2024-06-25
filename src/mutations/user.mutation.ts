import { GraphQLError, GraphQLID, GraphQLString } from "graphql";
import joi from "joi";

import apiWrapper, { LocalRequest } from "crud/apiWrapper";
import User, { Role, hash, UserDocument } from "models/user.model";

import update from "crud/update";
import { userType } from "types/user.type";
import remove from "crud/remove";
import create from "crud/create";
import { isCurrentUser } from "utils/authHelpers";
import { password } from "./../config/vars";
import { updateUserValidator, updatePasswordValidator } from "../validation/user.validation";
import { Types } from "mongoose";

const cloudinary = require("utils/cloudinary");

export default {
  updatePassword: apiWrapper(
    async (args, request) => {
      const { password, newPassword, id } = args;
      let user: UserDocument | null = await User.findById(id);

      let isValid = await user?.passwordMatches(password);

      if (user && isValid) {
        user.password = newPassword;

        user.save();
        return user;
      } else throw new GraphQLError("password is not valid");
    },

    userType,
    {
      password: { type: GraphQLString, required: true },
      newPassword: { type: GraphQLString, required: true },
      id: { type: GraphQLID, required: true },
    },
    // { validateSchema: updatePasswordValidator }
  ),

  updateUser: update(
    User,
    {
      fullName: GraphQLString,
      adress: GraphQLString,
      phone: GraphQLString,
      role: GraphQLString,
      // image: GraphQLString,
      gender: GraphQLString
    },
    userType,
    {
      pre: async (args: any, request: LocalRequest) => {
        let { user } = request;
        const { id, role, ...rest} = args;

        if (role) {
          let employee: UserDocument | null = await User.findById(id)
          if (employee){
           // @ts-ignore
            let employeeRestaurantId: Types.ObjectId | null = employee.type.restaurantId
            // @ts-ignore
            if (!Object.values(Role)?.includes(role) || !([Role.OWNER, Role.MANAGER].includes(user?.type.role!)) || !(employeeRestaurantId!).equals(user?.type.restaurantId!)){                           
                  throw new GraphQLError("Cant change the role");}
            else { 
              employee.type.role = role
              await employee.save()
            }
          }
        }

        if(rest.image){
          let uploadRes = await cloudinary.uploader.upload(rest.image, {folder: id})
          .catch((err:any) => {console.log(err); return err})            
          return {id, role, imageUrl: uploadRes.secure_url, ...rest};
        }
        return args;
      },  
      // validateSchema: updateUserValidator,
      authorizationRoles: [Role.USER, Role.MANAGER, Role.OWNER],
    }
  ),

  disableMe: apiWrapper(
    async (args, request) => {
      let { user } = request;
      User.findByIdAndUpdate(user?.id, { isActive: false }, (err, user) => {
        if (err) throw new GraphQLError(err);
      });
      return { user };
    },
    userType,
    {},
    {
      pre: (args, request) => {
        if (!isCurrentUser(request)) throw new GraphQLError("Invalid operation");
        return args;
      },
    }
  ),
};
