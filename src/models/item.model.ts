import mongoose, { Schema, Model, Document } from "mongoose";
import { IngredientSchemaType } from "./ingredient.model";
import {
  IngredientRestaurant,
  ingredientRestaurantSchemaType,
} from "./ingredientRestaurant.model";
import { Meal, mealSchemaType } from "./meal.model";

export interface Item {
  meal: Meal;
  quantity: number;
  note: string;
  price: number;
}

export interface ItemDocument extends Document, Item {}

export type ItemModel = Model<ItemDocument>;

export const itemSchemaType = new Schema<ItemDocument, ItemModel>(
  {
    meal: mealSchemaType,
    price: { type: Number, required: false, default: 1 },
    quantity: { type: Number, required: false, default: 1 },
    note: { type: String, required: false, trim: true },
  },
  {
    timestamps: true,
  }
);

const itemSchema = mongoose.model("Item", itemSchemaType);
export default itemSchema;
