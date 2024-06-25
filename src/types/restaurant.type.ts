import { GraphQLID, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLList, GraphQLFloat } from "graphql";
import { ingredientRestaurantType } from "./ingredient.type";
import { userType } from "./user.type";
import { menuType } from "types/menu.type";

export const restaurantType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: "Restaurant",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    location: { type: GraphQLString },
    phone: { type: GraphQLString },
    description: { type: GraphQLString },
    clients: { type: new GraphQLList(userType) },
    employees: { type: new GraphQLList(userType) },
    menu: { type: new GraphQLList(menuType) },
    isVerified: { type: GraphQLBoolean },
    isActive: { type: GraphQLBoolean },
    speciality: { type: new GraphQLList(GraphQLString) },
    loyaltyThreshold: { type: GraphQLInt },
    bonusPoints: { type: GraphQLInt },
    pointsEqv: { type: GraphQLInt },
    formPoints: { type: GraphQLInt },
    avgRating: { type: GraphQLFloat },
    bayesianEstimate: { type: GraphQLFloat },
    voteCount: { type: GraphQLInt },
    ingredients: { type: new GraphQLList(ingredientRestaurantType) },
    imageUrls: {
      type: new GraphQLList(GraphQLString),
      resolve(restaurant) {        
        if (restaurant.imageUrls.length > 0) return restaurant.imageUrls;
        else return ["https://via.placeholder.com/600x400/e0e0e0/615d5d?text=No+Image"];
      },
    },
  },
});
