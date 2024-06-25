import { GraphQLID, GraphQLObjectType, GraphQLString, GraphQLEnumType, GraphQLBoolean, GraphQLList } from "graphql";
import { Gender, Role } from "models/user.model";

export const userRole = new GraphQLEnumType({
  name: "Role",
  values: {
    [Role.ADMIN]: { value: Role.ADMIN },
    [Role.USER]: { value: Role.USER },
    [Role.MANAGER]: { value: Role.MANAGER },
    [Role.OWNER]: { value: Role.OWNER },
    [Role.COOK]: { value: Role.COOK },
    [Role.SERVER]: { value: Role.SERVER },
  },
});

export const userGender = new GraphQLEnumType({
  name: "Gender",
  values: {
    [Gender.MAN]: { value: Gender.MAN },
    [Gender.FEMALE]: { value: Gender.FEMALE },
  },
});

export const userRoleType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: "userRole",
  fields: {
    role: { type: userRole },
    restaurantId: { type: GraphQLID },
  },
});

export const userType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: "Users",
  fields: {
    id: { type: GraphQLID },
    type: { type: userRoleType },
    email: { type: GraphQLString },
    fullName: { type: GraphQLString },
    adress: { type: GraphQLString },
    phone: { type: GraphQLString },
    gender: { type: GraphQLString },
    isActive: { type: GraphQLBoolean },
    loyalty: { type: GraphQLList(GraphQLID) },
    // commands: { type: GraphQLList(commandType) },
    imageUrl: {
      type: GraphQLString,
      resolve(user) {
        if (user.imageUrl) return user.imageUrl;
        return "https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?k=20&m=1223671392&s=612x612&w=0&h=lGpj2vWAI3WUT1JeJWm1PRoHT3V15_1pdcTn2szdwQ0=";
      },
    },
  },
});
