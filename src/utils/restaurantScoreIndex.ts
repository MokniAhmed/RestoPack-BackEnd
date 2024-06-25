import { GraphQLError } from "graphql";
import Restaurant, { RestaurantDocument } from "models/restaurant.model";
import { ISatisfactionFormFields } from "models/satisfactionForm.model";

const fs = require("fs");
var path = require("path");

export async function updateRestaurantScore(restaurantId: string, commandSatisfactionFormResponse: Array<ISatisfactionFormFields>): Promise<void> {
  let restaurant: RestaurantDocument | null = await Restaurant.findById(restaurantId);

  if (restaurant) {
    let standardQuestionsFilePath = path.join(__dirname, "../static/satisfactionFormstandardQuestions.json");
    let standardQuestions = JSON.parse(fs.readFileSync(standardQuestionsFilePath, "utf8")).map(
      (question: { fieldName: string }) => question.fieldName
    );

    let standardQuestionsScores: Array<number> = standardQuestions.map((question: string) => {
      return Number(commandSatisfactionFormResponse.filter((response) => response.fieldName === question)[0].result);
    });

    //for now
    let avgStandardScore: number = standardQuestionsScores.reduce((prev, current) => prev + current) / standardQuestionsScores.length;

    restaurant.avgRating = (restaurant.avgRating + avgStandardScore) / 2;
    restaurant.voteCount++;
    restaurant.bayesianEstimate = await bayesianEstimate(restaurant.avgRating, restaurant.voteCount);
    await restaurant.save();
  } else throw new GraphQLError("Restaurant Not found");
}

export async function bayesianEstimate(r: number, v: number): Promise<number> {
  // rating = (r*v + C*m) / v + C
  // R = average for the restaurant (mean)
  // v = number of votes for the restaurant
  // m = minimum votes required to be listed (currently 10)
  // C = the mean vote across the whole report (currently 7.0)

  let m = 10;

  let pipeline = [
    {
      $group: {
        _id: null,
        m: {
          $sum: "$avg_rating",
        },
        total: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        c: {
          $divide: ["$m", "$total"],
        },
      },
    },
  ];

  // @ts-ignore
  let c: number = (await Restaurant.aggregate(pipeline))[0].c;

  return (r * v + c * m) / v + c;
}
