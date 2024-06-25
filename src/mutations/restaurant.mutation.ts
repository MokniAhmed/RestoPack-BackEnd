import create from "crud/create";
import update from "crud/update";

import { GraphQLError, GraphQLID, GraphQLInt, GraphQLList, GraphQLString } from "graphql";

import { restaurantType } from "types/restaurant.type";
import { isRestaurantEmployee } from "utils/authHelpers";

import Restaurant from "models/restaurant.model";
import User, { Role } from "models/user.model";

import { createRestaurantValidator } from "../validation/restaurant.validation";
const cloudinary = require("utils/cloudinary");

export default {
  createRestaurantRequest: create(
    Restaurant,
    {
      name: { type: GraphQLString, required: true },
      email: { type: GraphQLString, required: true },
      location: { type: GraphQLString, required: true },
      phone: { type: GraphQLString, required: false },
      images: { type: GraphQLList(GraphQLString), required: false },
    },
    restaurantType,
    {
      pre: async (args, request) => {
        let { user } = request

        if (!user) throw new GraphQLError("You must login");
        if (request.user?.type.role === Role.ADMIN) return { ...args, isVerified: true, isActive: true };
        return args;
      },
      
      post: async ({ result: restaurant, request, args }) => {
        const { images } = args as any
        
        
        const { user } = request
        if (!user) throw new GraphQLError("You must login");

        const restoId = restaurant.id;
        const userRole = user.type.role;
        let userId = user._id;
                
        if (userRole === Role.ADMIN) {
          const _user = await User.findOne({ email: restaurant.email });
          if (!_user) throw new GraphQLError("User not found");
          userId = _user.id;
        }

        let imageUrlsList: Array<string> = [];
        if (images?.length > 0) {
          await Promise.all(
            images.map(async (image: string) => {
              if (!image.startsWith("https")) {
                let uploadRes = await cloudinary.uploader.upload(image, { folder: restoId }).catch(() => {
                  throw new GraphQLError("image upload failed");
                });
                imageUrlsList.push(uploadRes.secure_url);
              } else imageUrlsList.push(image);
            })
          );
        }
        return Restaurant.findByIdAndUpdate(restoId, { $addToSet: { employees: userId }, imageUrlsList }, (err, resto) => {
          if (err) throw new GraphQLError(err);
          return { resto };
        });
      },
      authorizationRoles: [Role.ADMIN, Role.USER],
      validateSchema: createRestaurantValidator,
      
    }
  ),

  updateLoyaltySystem: update(
    Restaurant,
    {
      loyaltyThreshold: GraphQLInt,
      pointsEqv: GraphQLInt,
      bonusPoints: GraphQLInt,
    },
    restaurantType,
    {
      pre: async (args, request) => {
        if (!isRestaurantEmployee(request, args.id)) throw new GraphQLError("err");
        return args;
      },
      // authorizationRoles: [Role.ADMIN, Role.OWNER],
    }
  ),

  updateRestaurant: update(
    Restaurant,
    {
      id: GraphQLID,
      email: GraphQLString,
      name: GraphQLString,
      location: GraphQLString,
      phone: GraphQLString,
      description: GraphQLString,
      images: GraphQLList(GraphQLString),
      speciality: GraphQLList(GraphQLString),
      loyaltyThreshold: GraphQLInt,
      pointsEqv: GraphQLInt,
      bonusPoints: GraphQLInt,
      formPoints: GraphQLInt,
    },
    restaurantType,
    {
      pre: async (args) => {
        const { images, id, ...rest } = args;
        let imageUrlsList: Array<string> = [];

        if (images.length > 0) {
          await Promise.all(
            images.map(async (image: string) => {
              if (!image.startsWith("https") && image.length !== 0) {
                let uploadRes = await cloudinary.uploader.upload(image, { folder: id }).catch((err: any) => {
                  throw new GraphQLError("image upload failed");
                });
                imageUrlsList.push(uploadRes.secure_url);
              } else imageUrlsList.push(image);
            })
          );
          return { id, ...rest, imageUrls: imageUrlsList };
        }
        return args;
      },
    }
  ),
};
