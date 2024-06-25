import { ObjectId } from "mongoose";
import Restaurant from "models/restaurant.model";
import { GraphQLError } from "graphql";

export async function calculateItemPrice(mealPrice: number, quantity: number): Promise<number> {
    let priceMeal = mealPrice * quantity;
    return priceMeal;
  }
  
export async function calculateFinalPrice(restaurantId: ObjectId, totalPrice: number, discountPoints: number): Promise<number> {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new GraphQLError("restaurant not found");
        return totalPrice - discountPoints * (restaurant.loyaltyThreshold / restaurant.pointsEqv);
}