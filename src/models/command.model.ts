import mongoose, { Schema, Model, Document } from "mongoose";
import { Item, itemSchemaType } from "./item.model";

export interface Command {
  restaurantId: Schema.Types.ObjectId;
  items: Array<Schema.Types.ObjectId>;
  totalPrice: number;
  finalPrice: number;
  status: Status;
  type: string;
  referral: Schema.Types.ObjectId;
  duration: number;
  discountPoints: number;
  bonusPoints: number;
  archived: boolean;
  isFormFilled: boolean
}
export enum Status {
  INVALID = "inValid",
  VALID = "valid",
  IN_PROGRESS = "inProgress",
  WAITING = "waiting",
  FINISHED = "finished",
  DELIVERED = "delivered",
}
const status = [Status.FINISHED, Status.INVALID, Status.IN_PROGRESS, Status.WAITING, Status.VALID, Status.DELIVERED];

export enum Types {
  IMPORT = "import",
  INPLACE = "inplace",
}
const types = [Types.INPLACE, Types.IMPORT];

export interface CommandDocument extends Document, Command {}

export type CommandModel = Model<CommandDocument>;

export const commandSchemaType = new Schema<CommandDocument, CommandModel>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Menu" },
    items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
    totalPrice: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    status: { type: String, enum: status, default: Status.WAITING },
    type: { type: String, enum: types, default: Types.INPLACE },
    referral: { type: Schema.Types.ObjectId, ref: "User" },
    duration: { type: Number, required: false },
    discountPoints: { type: Number, default: 0 },
    bonusPoints: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
    isFormFilled: { type: Boolean, default:false}
  },
  {
    timestamps: true,
  }
);

const commandSchema = mongoose.model("Command", commandSchemaType);
export default commandSchema;
