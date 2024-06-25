import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString, GraphQLUnionType } from "graphql";
import { FieldType } from "models/satisfactionForm.model";

export const fieldType = new GraphQLEnumType({
  name: "fieldType",
  values: {
    [FieldType.TEXTAREA]: { value: FieldType.TEXTAREA },
    [FieldType.RADIO]: { value: FieldType.RADIO },
  },
});

export const satisfactionFormFieldsType = new GraphQLObjectType({
  name: "satisfactionFormFields",
  fields: {
    id: { type: GraphQLID },
    fieldId: {
      type: GraphQLID,
      resolve(form) {
        if (form.fieldId) return form.fieldId;
        else return form._id;
      },
    },
    fieldName: { type: GraphQLString },
    type: { type: fieldType },
    required: { type: GraphQLBoolean },
    result: { type: GraphQLString },
  },
});

export const clientSatisfactionFormType = new GraphQLObjectType({
  name: "clientSatisfactionForm",
  fields: {
    userId: { type: GraphQLID },
    restaurantId: { type: GraphQLID },
    commandId: { type: GraphQLID },
    response: { type: GraphQLList(satisfactionFormFieldsType) },
    version: { type: GraphQLInt },
  },
});

export const satisfactionFormType = new GraphQLObjectType({
  name: "satisfactionForm",
  fields: {
    version: { type: GraphQLInt },
    template: { type: GraphQLList(satisfactionFormFieldsType) },
  },
});

export const QuestionRatingsType = new GraphQLObjectType({
  name: "questionRatings",
  fields: {
    total: { type: GraphQLInt },
    rating: { type: GraphQLString },
    question: { type: GraphQLString },
    questionId: { type: GraphQLID },
  },
});
export const QuestionCommentsType = new GraphQLObjectType({
  name: "questionComments",
  fields: {
    comments: { type: GraphQLList(GraphQLString) },
    question: { type: GraphQLString },
    questionId: { type: GraphQLID },
  },
});

export const QuestionType = new GraphQLObjectType({
  name: "questionT",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
  },
});
