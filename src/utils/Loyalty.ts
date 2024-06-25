import { GraphQLError } from "graphql";
import { floor } from "lodash";
import { CommandDocument } from "models/command.model";
import Restaurant from "models/restaurant.model";
import User from "models/user.model";
import UserLoyalty from "models/userLoyalty.model";

export function calculPoints(loyaltyThreshold: number, thresholdTracker: number, bonusPoints: number, price: number): number[] {
    let resultat: number[] = [];
    resultat.push(floor((thresholdTracker + price) / loyaltyThreshold) * bonusPoints, (thresholdTracker + price) % loyaltyThreshold);
    return resultat;
  }
  
export async function updateUserLoyalty(command: CommandDocument): Promise<number> {
let bonusPoints = 0;

const restaurant = await Restaurant.findById(command.restaurantId);
if (!restaurant) throw new GraphQLError("restaurant not found");

const user = await User.findOne({ commands: command.id });
if (!user) throw new GraphQLError("user not found");

let isNewClient = !restaurant.clients.includes(user._id);

if (isNewClient) {
    restaurant.clients.push(user._id);
    restaurant.save();

    const [points, thresholdTracker] = calculPoints(restaurant.loyaltyThreshold, 0, restaurant.bonusPoints, command.totalPrice);
    bonusPoints = points;
    let loyaltyS = new UserLoyalty();
    loyaltyS.restaurantId = restaurant.id;
    loyaltyS.userId = user.id;
    loyaltyS.points = points;
    loyaltyS.thresholdTracker = thresholdTracker;
    await loyaltyS.save().then(async (result: any) => {
    user.loyalty.push(result.id);
    await user.save();
    });
} else {
    let userLoyalty = await UserLoyalty.findOne({
    userId: user.id,
    restaurantId: restaurant.id,
    });

    const [newPoints, thresholdTracker] = calculPoints(
    restaurant.loyaltyThreshold,
    userLoyalty.thresholdTracker,
    restaurant.bonusPoints,
    command.totalPrice
    );

    userLoyalty.thresholdTracker = thresholdTracker;
    userLoyalty.points = userLoyalty.points + newPoints - command.discountPoints;
    bonusPoints = newPoints;
    await userLoyalty.save().catch((err: any) => {
    throw new GraphQLError(err);
    });
}

return bonusPoints;
}