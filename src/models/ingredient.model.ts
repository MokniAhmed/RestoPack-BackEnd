import mongoose, { Schema, Model, Document } from "mongoose";

export interface Ingredient {
  name: string;
}

export interface IngredientDocument extends Document, Ingredient {}

export const IngredientSchemaType = new Schema<IngredientDocument>({
  name: { type: String, required: true, unique: false, trim: true, lowercase: true },
});

const ingredientSchema = mongoose.model("Ingredient", IngredientSchemaType);
export default ingredientSchema;
