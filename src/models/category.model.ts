import mongoose, { Schema, Model, Document } from "mongoose";
import { Meal, mealSchemaType } from "./meal.model";
export interface Category {
  name: string;
  meals: Array<Schema.Types.ObjectId>;
}

export interface CategoryDocument extends Document, Category {}

export type CategoryModel = Model<CategoryDocument>;

const categorySchema = new Schema<CategoryDocument, CategoryModel>(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    meals: [{ type: Schema.Types.ObjectId, ref: "Meal" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Category", categorySchema);
