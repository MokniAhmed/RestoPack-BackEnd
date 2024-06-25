import mongoose, { Schema, Model, Document } from "mongoose";

export interface Menu {
  saison: string;
  categories: Array<Schema.Types.ObjectId>;
  visibility: boolean;
}

export interface MenuDocument extends Document, Menu {}

export type MenuModel = Model<MenuDocument>;

const menuSchema = new Schema<MenuDocument, MenuModel>(
  {
    saison: { type: String },
    visibility: { type: Boolean, required: false, default: false },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Menu", menuSchema);
