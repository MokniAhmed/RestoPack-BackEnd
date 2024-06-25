import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";

import { env, expirationInterval, accessSecret } from "config/vars";
import { userRole } from "types/user.type";

export enum Role {
  USER = "user",
  ADMIN = "admin",
  OWNER = "owner",
  SERVER = "server",
  COOK = "cook",
  MANAGER = "manager",
}

export enum Gender {
  MAN = "man",
  FEMALE = "female",
}

const roles = [Role.USER, Role.ADMIN, Role.OWNER, Role.COOK, Role.SERVER, Role.MANAGER];
const genders = [Gender.MAN, Gender.FEMALE];
export interface userRole {
  role: Role;
  restaurantId: Schema.Types.ObjectId | null;
}
export interface User {
  email: string;
  password: string;
  fullName: string;
  adress: string;
  phone: string;
  gender: Gender;
  isActive: boolean;
  type: userRole;
  gneder: Gender;
  loyalty: Array<Schema.Types.ObjectId>;
  confirmationCode: string;
  commands: Array<Schema.Types.ObjectId>;
  imageUrl: String;
}

export interface UserDocument extends Document, User {
  generateToken: () => { token: string; expiresIn: string };
  passwordMatches: (password: string) => Promise<boolean>;
}

export type UserModel = Model<UserDocument>;

const userSchema = new mongoose.Schema<UserDocument, UserModel>(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      min: 7,
      required: true,
    },
    fullName: {
      type: String,
      trim: true,
      max: 30,
      required: true,
    },
    gender: {
      type: String,
      enum: genders,
      required: false,
    },
    confirmationCode: {
      type: String,

      required: false,
    },
    type: {
      role: {
        type: String,
        enum: roles,
        default: Role.USER,
      },
      restaurantId: { type: Schema.Types.ObjectId, default: null },
    },
    adress: {
      type: String,
      trim: true,
      default: null,
      required: false,
    },
    phone: {
      type: String,
      trim: true,
      match: /^\d{1,8}$/,
      default: null,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    loyalty: [{ type: Schema.Types.ObjectId, ref: "UserLoyalty" }],
    commands: [{ type: Schema.Types.ObjectId, ref: "Command" }],
    imageUrl: { type: String, required: false },
  },

  {
    timestamps: true,
  }
);

export async function hash(password: string) {
  const rounds = env === "test" ? 1 : 10;
  return await bcrypt.hash(password, rounds);
}

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) this.password = await hash(this.password);
    if (this.isModified("role") && this.type.role == Role.USER) this.type.restaurantId = null;
    return next();
  } catch (e: any) {
    return next(e);
  }
});

/**
 * Methods
 */
userSchema.method({
  generateToken() {
    const payload = {
      sub: this._id,
    };

    const expiresIn = moment().add(expirationInterval, "minutes");

    const token = jwt.sign(payload, accessSecret, {
      expiresIn: expiresIn.unix(),
    });
    // add lastLogin
    return { token, expiresIn: expiresIn.toISOString() };
  },

  passwordMatches(password: string) {
    return bcrypt.compare(password, this.password);
  },
});

export default mongoose.model("User", userSchema);
