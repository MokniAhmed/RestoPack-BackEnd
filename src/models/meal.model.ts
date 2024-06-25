import mongoose, { Schema, Model, Document } from "mongoose";
import ingredientSchema, { Ingredient, IngredientSchemaType } from "./ingredient.model";

export interface Meal {
  name: string;
  price: number;
  isAvailable: boolean;
  ingredients: Array<Schema.Types.ObjectId>;
  restaurantId: Schema.Types.ObjectId;
  imageUrl: String;

}

export interface MealDocument extends Document, Meal {}

export type MealModel = Model<MealDocument>;

export const mealSchemaType = new Schema<MealDocument, MealModel>(
  {
    name: { type: String, required: true, unique: false, trim: true },
    isAvailable: { type: Boolean, required: true, default: true },
    price: { type: Number, required: true },
    ingredients: [{ type: Schema.Types.ObjectId, ref: "IngredientRestaurant" }],
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
    imageUrl: { type: String, required:false}

  },
  {
    timestamps: true,
  }
);

const mealSchema = mongoose.model("Meal", mealSchemaType);
export default mealSchema;
