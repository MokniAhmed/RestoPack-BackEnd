import mongoose, { Schema, Model, Document } from "mongoose";

export interface IngredientRestaurant {
  name: string;
  isAvailable: boolean;
  restaurantId: Schema.Types.ObjectId;
  isSupplement: boolean;
  price: number;
  imageUrl: String;

}

export interface IngredientRestaurantDocument extends Document, IngredientRestaurant {}

export type IngredientRestaurantModel = Model<IngredientRestaurantDocument>;

export const ingredientRestaurantSchemaType = new Schema<IngredientRestaurantDocument, IngredientRestaurantModel>({
  name: { type: String, required: true, unique: false, trim: true, lowercase: true },
  isAvailable: { type: Boolean, required: true, default: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
  isSupplement: { type: Boolean, required: true, default: false },
  price: { type: Number, required: false, default: 0 },
  imageUrl: { type: String, required:false}
});

const IngredientRestaurantSchema = mongoose.model("IngredientRestaurant", ingredientRestaurantSchemaType);
export default IngredientRestaurantSchema;
