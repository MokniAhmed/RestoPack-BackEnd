import { GraphQLError } from "graphql";
import { FieldType, ISatisfactionFormFieldsDocument, ISatisfactionFormFields } from "models/satisfactionForm.model";
import Command from "models/command.model";
import Item from "models/item.model";
import Restaurant from "models/restaurant.model";

const fs = require("fs");
var path = require("path");

export async function generateItemsSatisfactionFormFields(items: Array<any>): Promise<Array<ISatisfactionFormFields>> {
  let itemsSatisfactionForm: Array<ISatisfactionFormFields> = new Array();
  let field: ISatisfactionFormFields;
  await Promise.all(
    items.map(async (itemId) => {
      let item = await Item.findById(itemId);
      if (item) {
        let mealName: string = item.meal.name;
        // @ts-ignore
        let mealId: string = item.meal._id;

        field = {
          fieldId: mealId,
          fieldName: mealName,
          type: FieldType.RADIO,
          required: true,
          result: "",
        };
        itemsSatisfactionForm.push(field);
      }
    })
  );

  return itemsSatisfactionForm;
}

export async function generateRestaurantSatisfactionFormFields(
  inputTemplate: Array<ISatisfactionFormFieldsDocument & { type: string; category?: string }>
): Promise<Array<ISatisfactionFormFields>> {
  let field: ISatisfactionFormFields;
  let restaurntSatisfactionForm: Array<ISatisfactionFormFields> = new Array();

  let standardQuestionsFilePath = path.join(__dirname, "../static/satisfactionFormstandardQuestions.json");

  let standardQuestions = JSON.parse(fs.readFileSync(standardQuestionsFilePath, "utf8"));
  inputTemplate.unshift(...standardQuestions);

  await Promise.all(
    inputTemplate.map((input) => {
      // @ts-ignore
      let inputType = input.type == "Textarea" ? FieldType.TEXTAREA : FieldType.RADIO;

      field = {
        fieldName: input.fieldName,
        type: inputType,
        required: input.required,
        result: "",
      };
      restaurntSatisfactionForm.push(field);
    })
  );
  return restaurntSatisfactionForm;
}
export async function generateClientSatisfactionForm(restaurantId: string, commandId: string): Promise<Array<ISatisfactionFormFieldsDocument>> {
  let satisfactionForm = new Array();

  let command = await Command.findById(commandId).select("items");
  if (!command) throw new GraphQLError("command not found")
  
  // set command satisfaction form as filled
  command.isFormFilled = true
  await command.save()

  let restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new GraphQLError("restaurant not found")

  let itemsFormFields = await generateItemsSatisfactionFormFields(command.items);

  let template = restaurant.satisfactionForm.slice(-1)[0].template;
  try {
    satisfactionForm.push(...template);
  } catch (e) {
    throw new GraphQLError("Restaurant doesnt have satisfaction form");
  }
  
  satisfactionForm.push(...itemsFormFields);
  return satisfactionForm;
}
