import apiWrapper from "crud/apiWrapper";
import { GraphQLError, GraphQLID, GraphQLInt, GraphQLList, GraphQLString } from "graphql";
//@ts-ignore
import { QuestionCommentsType, QuestionRatingsType, satisfactionFormFieldsType, QuestionType } from "types/satisfactionForm.type";
import Restaurant, { RestaurantDocument } from "models/restaurant.model";
import { clientSatisfactionFormSchema, ISatisfactionFormFields, ISatisfactionFormFieldsDocument } from "models/satisfactionForm.model";
import { generateClientSatisfactionForm } from "utils/satisfactionFormGenerator";
import { LeanDocument, Schema, Types } from "mongoose";

export default {
  getCommandSatisfactionForm: apiWrapper(
    async (args, request) => {
      const { commandId, restaurantId } = args;
      return await generateClientSatisfactionForm(restaurantId, commandId);
    },
    new GraphQLList(satisfactionFormFieldsType),
    {
      restaurantId: { type: GraphQLID },
      commandId: { type: GraphQLID },
    },
    {}
  ),

  getLatestRestaurantSatisfactionForm: apiWrapper(
    async (args, request) => {
      let { restaurantId } = args;
      let restaurant: RestaurantDocument | null = await Restaurant.findById(restaurantId);

      if (restaurant) {
        let satisfactionFormList: Array<{
          version: number;
          template: Array<ISatisfactionFormFields>;
        }> = restaurant.satisfactionForm;

        if (satisfactionFormList.length > 0) return satisfactionFormList[satisfactionFormList.length - 1].template;
        else return null;
      } else throw new GraphQLError("restaurant not found");
    },
    new GraphQLList(satisfactionFormFieldsType),
    {
      restaurantId: { type: GraphQLID },
    },
    {}
  ),

  getQuestionRatings: apiWrapper(
    async (args, request) => {
      let { questionId, restaurantId } = args;
      const tem = await clientSatisfactionFormSchema.find({ restaurantId: restaurantId });

      // @ts-ignore
      var arr = [];
      await tem.map((t: any) => {
        t.response.map((q: any) => {
          if (q.fieldId == questionId) {
            arr.push(parseInt(q.result));
          }
        });
      });
      // @ts-ignore
      return arr;

      // let pipeline = [
      //   {
      //     $match: {
      //       restaurantId: Types.ObjectId(restaurantId),
      //     },
      //   },
      //   {
      //     $project: {
      //       questionsRatings: {
      //         $zip: {
      //           inputs: ["$response.fieldId", "$response.result", "$response.fieldName"],
      //         },
      //       },
      //       _id: 0,
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$questionsRatings",
      //     },
      //   },
      //   {
      //     $match: {
      //       "questionsRatings.0": Types.ObjectId(questionId),
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: "$questionsRatings",
      //       total: {
      //         $sum: 1,
      //       },
      //     },
      //   },
      //   {
      //     $project: {
      //       rating: {
      //         $arrayElemAt: ["$$ROOT._id", 1],
      //       },
      //       questionId: {
      //         $first: "$$ROOT._id",
      //       },
      //       question: {
      //         $last: "$$ROOT._id",
      //       },
      //       total: 1,
      //       _id: 0,
      //     },
      //   },
      // ];

      // return await clientSatisfactionFormSchema.aggregate(pipeline);
    },
    GraphQLList(GraphQLInt),
    {
      questionId: { type: GraphQLID, required: true },
      restaurantId: { type: GraphQLID, required: true },
    },
    {}
  ),
  getQuestionComments: apiWrapper(
    async (args, request) => {
      let { questionId, restaurantId } = args;

      let pipeline = [
        {
          $match: {
            restaurantId: Types.ObjectId(restaurantId),
          },
        },
        {
          $project: {
            questions: {
              $zip: {
                inputs: ["$response.fieldId", "$response.fieldName", "$response.result"],
              },
            },
            _id: 0,
          },
        },
        {
          $unwind: {
            path: "$questions",
          },
        },
        {
          $match: {
            "questions.0": Types.ObjectId(questionId),
          },
        },
        {
          $group: {
            _id: {
              $first: "$questions",
            },
            comments: {
              $push: {
                $last: "$questions",
              },
            },
            question: {
              $addToSet: {
                $arrayElemAt: ["$questions", 1],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            comments: 1,
            questionId: "$$ROOT._id",
            question: {
              $first: "$question",
            },
          },
        },
      ];
      return await clientSatisfactionFormSchema.aggregate(pipeline);
    },
    GraphQLList(QuestionCommentsType),
    {
      questionId: { type: GraphQLID, required: true },
      restaurantId: { type: GraphQLID, required: true },
    },
    {}
  ),

  getAllQuestions: apiWrapper(
    async (args) => {
      let { restaurantId } = args;

      let restaurant = await Restaurant.findById(restaurantId);
      if (restaurant) {
        let result = restaurant.satisfactionForm?.map((form) => {
          return form.template.map((question: LeanDocument<ISatisfactionFormFieldsDocument>) => {
            return { id: question._id, fieldId: question._id, fieldName: question.fieldName, type: question.type };
          });
        });
        return result.flat();
      }
    },
    GraphQLList(satisfactionFormFieldsType),
    {
      restaurantId: { type: GraphQLID, required: true },
    }
  ),

  getStandardQuestions: apiWrapper(
    async (args) => {
      const fs = require("fs");
      var path = require("path");

      let standardQuestionsFilePath = path.join(__dirname, "../static/satisfactionFormstandardQuestions.json");
      let standardQuestions = JSON.parse(fs.readFileSync(standardQuestionsFilePath, "utf8")).map(
        (question: { fieldName: string }) => question.fieldName
      );

      return standardQuestions;
    },
    GraphQLList(GraphQLString),
    {}
  ),
};
