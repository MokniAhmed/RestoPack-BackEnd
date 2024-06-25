import mongoose, { Schema, Model, Document, ObjectId } from "mongoose";
import { ISatisfactionFormFields, satisfactionFormSchemaType } from "./satisfactionForm.model";

export interface Restaurant {
  email: string;
  name: string;
  location: string;
  phone: string;
  clients: Array<Schema.Types.ObjectId>;
  employees: Array<Schema.Types.ObjectId>;
  menu: Array<Schema.Types.ObjectId>;
  speciality: Array<string>;
  isVerified: boolean;
  isActive: boolean;
  description: string;
  loyaltyThreshold: number;
  satisfactionForm: Array<{
    version: number;
    template: Array<ISatisfactionFormFields>;
  }>;
  pointsEqv: number;
  bonusPoints: number;
  formPoints: number;
  avgRating: number;
  voteCount: number;
  bayesianEstimate: number;
  imageUrls: Array<String>;
}

export interface RestaurantDocument extends Document, Restaurant {}

export type RestaurantModel = Model<RestaurantDocument>;

const restaurantSchema = new Schema<RestaurantDocument, RestaurantModel>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
      lowercase: true,
      unique: false,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      max: 40,
    },
    location: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    description: { type: String, required: false, default: "" },

    clients: [{ type: Schema.Types.ObjectId, ref: "User" }],
    employees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    menu: [{ type: Schema.Types.ObjectId, ref: "Menu", unique:false }],
    speciality: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    satisfactionForm: [satisfactionFormSchemaType],
    loyaltyThreshold: { type: Number, required: false, default: 50 },
    pointsEqv: { type: Number, required: false, default: 200 },
    bonusPoints: { type: Number, required: false, default: 100 },
    formPoints: { type: Number, required: false, default: 10 },
    imageUrls: [{ type: String, required: false }],
    voteCount: {type: Number, default:10},
    avgRating: {type: Number, default: 2.5},
    bayesianEstimate:{type: Number, default: 2.5}
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Restaurant", restaurantSchema);
