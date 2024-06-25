import {
  GraphQLBoolean,
  GraphQLError,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  UniqueInputFieldNamesRule,
} from "graphql";
import Restaurant, { RestaurantDocument } from "models/restaurant.model";
import { satisfactionFormType } from "types/satisfactionForm.type";
import { clientSatisfactionFormSchema, FieldType, ISatisfactionFormFields, ISatisfactionFormFieldsDocument } from "models/satisfactionForm.model";
import { apiWrapper } from "../crud/apiWrapper";
import UserLoyalty from "models/userLoyalty.model";
import { generateClientSatisfactionForm, generateRestaurantSatisfactionFormFields } from "utils/satisfactionFormGenerator";
import { updateRestaurantScore } from "utils/restaurantScoreIndex";

const satisfactionFormInputType = new GraphQLInputObjectType({
  name: "clientSatisfactionFormInput",
  fields: () => ({
    fieldId: { type: GraphQLID },
    fieldName: { type: GraphQLString },
    type: { type: GraphQLString },
    result: { type: GraphQLString },
    required: { type: GraphQLBoolean },
  }),
});

export default {
  saveCommandSatisfactionForm: apiWrapper(
    async (args, request) => {
      let { commandId, restaurantId, form } = args;
      let { user } = request;
      let preForm: Array<ISatisfactionFormFieldsDocument> = await generateClientSatisfactionForm(restaurantId, commandId);

      let filteredForm = preForm.map((formField) => {
        let fieldIndex: number = form.findIndex((field: any) => {
          if (formField._id) return field.fieldId == formField._id;
          return field.fieldId == formField.fieldId;
        });

        if (fieldIndex !== -1) {
          let responseField = form[fieldIndex];

          let respond: string | number = responseField.result;
          if (formField.type == FieldType.RADIO) {
            if (isNaN(Number(respond)) || Number(respond) < 1 || Number(respond) > 5) throw new GraphQLError("Invalid Form response " + respond);
          }
          if (formField.type == FieldType.TEXTAREA && formField.required) {
            // @ts-ignore
            if (respond.trim() === "") throw new GraphQLError("Invalid Form response " + respond);
          }

          return responseField;
        } else throw new GraphQLError("Invalid Form response");
      });

      if (user) {
        let userId = user.id;
        let userLoyalty = await UserLoyalty.findOne({ userId, restaurantId });
        // @ts-ignore
        let restaurantFormLoyalty = (await Restaurant.findById(restaurantId)).formPoints;

        userLoyalty.points += restaurantFormLoyalty;
        await userLoyalty.save();

        let satisfactionForm = new clientSatisfactionFormSchema({ userId, commandId, restaurantId, response: filteredForm });

        await satisfactionForm.save();

        

        await updateRestaurantScore(restaurantId, filteredForm)
        
        return { template: filteredForm };
      } else {
        throw new GraphQLError("User not found");
      }
    },
    satisfactionFormType,
    {
      commandId: { type: GraphQLID },
      restaurantId: { type: GraphQLID },
      form: { type: GraphQLList(satisfactionFormInputType) },
    },
    {}
  ),

  saveRestaurantSatisfactionForm: apiWrapper(
    async (args, request) => {
      let { restaurantId, form } = args;
      let restaurant = await Restaurant.findById(restaurantId);
      let version: number = 0;
      if (restaurant) {
        if (restaurant.satisfactionForm.length > 0) version = restaurant.satisfactionForm.slice(-1)[0].version++;

        let template = await generateRestaurantSatisfactionFormFields(form);

        restaurant.satisfactionForm.push({
          version,
          template,
        });
        return await restaurant
          .save()
          .then((restaurant: RestaurantDocument) => {
            let lastestForm = restaurant.satisfactionForm.slice(-1)[0];

            return { template: lastestForm.template, version: lastestForm.version };
          })
          .catch((e) => {
            throw new GraphQLError(e);
          });
      }
      throw new GraphQLError("Could't save form");
    },
    satisfactionFormType,
    {
      restaurantId: { type: GraphQLID },
      form: { type: GraphQLList(satisfactionFormInputType) },
    }
  ),
};
