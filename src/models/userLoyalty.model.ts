import mongoose, { Schema } from "mongoose";

export interface userLoyalty {
  restaurantId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;

  points: number;
  thresholdTracker: number;
}

const userLoyaltySchema = new Schema<userLoyalty>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  thresholdTracker: {
    type: Number,
    default: 0,
  },  
},
{
  timestamps: true,
});

export default mongoose.model("UserLoyalty", userLoyaltySchema);
