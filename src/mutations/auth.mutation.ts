import apiWrapper from "crud/apiWrapper";
import create from "crud/create";

import { GraphQLError, GraphQLNonNull, GraphQLString } from "graphql";
import nodemailer from "../config/confirmationMail/nodemailer.config";

import { authType } from "types/auth.type";
import { userType } from "types/user.type";


import User, {UserDocument } from "models/user.model";
import RefreshToken, { RefreshTokenDocument } from "models/refreshToken.model";


import { generateTokenResponse, getAgent } from "utils/authHelpers";
import { refreshValidator, loginValidator, registerValidator, resetPasswordValidator } from "../validation/user.validation";
import jwt from "jsonwebtoken";

export default {
  login: apiWrapper(
    async (args, req) => {
      const user = await User.findOne({ email: args.email });
      if (!user || !(await user.passwordMatches(args.password))) throw new GraphQLError("Email et mot de passe ne correspondent pas");
      if (!user.isActive) {
        const token = await generateTokenResponse(user, req);
        user.confirmationCode = token.accessToken;
        user.save();
        nodemailer.sendConfirmationEmailC(user.fullName, user.email, token.accessToken);
        throw new GraphQLError("active votre compte");
      }
      const token = await generateTokenResponse(user, req);

      return { token, user };
    },
    authType,
    {
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
    },
    { validateSchema: loginValidator }
  ),
  confirmeUser: apiWrapper(
    async (args, req) => {
      const user = await User.findOneAndUpdate(
        {
          confirmationCode: args.confirmationCode,
        },
        { isActive: true, confirmationCode: "compte active" }
      );
      if (!user) throw new GraphQLError("user not found");

      const token = await generateTokenResponse(user, req);

      return { token, user };
    },
    authType,
    {
      confirmationCode: { type: new GraphQLNonNull(GraphQLString) },
    }
    //{ validateSchema: refreshValidator }
  ),
  register: create(
    User,
    {
      email: { type: GraphQLString, required: true },
      password: { type: GraphQLString, required: true },
      fullName: { type: GraphQLString, required: true },
      phone: { type: GraphQLString, required: false },
      gender: { type: GraphQLString, required: false },
    },
    userType,
    {
      validateSchema: registerValidator,
      pre: async (args) => {
        const { email, ...rest } = args;
        if (email) {
          const existEmail = await User.findOne({ email });
          if (existEmail) throw new GraphQLError("Email existe déjà");
        }
        const token = jwt.sign({ email: email }, "process.env.SECRET");
        const confirmationCode = token;
        return { ...rest, email, confirmationCode };
      },
      post: async ({ result: user }) => {
        nodemailer.sendConfirmationEmailC(user.fullName, user.email, user.confirmationCode);
        return user;
      },
    }
  ),

  refresh: apiWrapper(
    async (args, req) => {
      const refreshToken: RefreshTokenDocument | null = await RefreshToken.findOne({
        token: args.refreshToken,
      });

      if (!refreshToken) throw new GraphQLError("Invalid token");
      const user: UserDocument | null = await User.findOne({ _id: refreshToken.user });
      if (!user) throw new GraphQLError("Invalid token");
      const token = await generateTokenResponse(user, req);
      return { user, token };
    },
    authType,
    {
      refreshToken: { type: new GraphQLNonNull(GraphQLString) },
    },
    {
      validateSchema: refreshValidator,
    }
  ),
  logout: apiWrapper(
    async (_, req) => {
      const { user } = req;
      const agent = getAgent(req);
      if (user) {
        await RefreshToken.deleteOne({ userId: user.id, agent });
      }
      return "done";
    },
    GraphQLString,
    {},
    { authorizationRoles: [] }
  ),

  resetPassword: apiWrapper(
    async (args) => {
      const { email } = args;
      const token = jwt.sign({ email: email }, "process.env.SECRET");

      return await User.findOneAndUpdate({ email }, { confirmationCode: token })
        .select(Object.keys(userType.getFields()).join(" ") + " confirmationCode")
        .then((user) => {
          return { user, token: token };
        });
    },
    GraphQLString,
    {
      email: { type: GraphQLString, required: true },
    },
    {
      pre: async (args) => {
        const { email } = args;
        const user = await User.findOne({ email });
        if (!user) throw new GraphQLError("user not found");
        if (!user.isActive) throw new GraphQLError("user is Not Active");

        return { email };
      },
      validateSchema: resetPasswordValidator,
      // authorizationRoles: [Role.ADMIN, Role.OWNER,Role.USER],
      post: async ({ result: result }) => {
        nodemailer.resetPasswordEmailC(result?.user?.fullName, result?.user?.email, result?.token);
        return "send";
      },
    }
  ),

  confirmePassword: apiWrapper(
    async (args) => {
      const user = await User.findOne({
        confirmationCode: args.confirmationCode,
      });
      if (user) {
        user.confirmationCode = "compte active ";
        user.password = args.password;
        return user.save().then(() => "updated");
      } else throw new GraphQLError("user not found");

    },
    GraphQLString,
    {
      confirmationCode: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
    }
  ),
};
