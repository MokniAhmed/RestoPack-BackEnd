import mongoose, { Schema, Model, Document } from "mongoose";


export enum FieldType {
  TEXTAREA = "Textarea",
  RADIO = "Radio"
}

export const fieldTypes = [FieldType.TEXTAREA, FieldType.RADIO];

//form fields interface
export interface ISatisfactionFormFields {
  fieldName: string
  fieldId?: string
  type: FieldType
  required: boolean
  result: string
}
export interface ISatisfactionFormFieldsDocument extends Document, ISatisfactionFormFields {}
export type ISatisfactionFormFieldsModel = Model<ISatisfactionFormFieldsDocument>;

// Client form interface
export interface ClientSatisfactionForm {
  userId: Schema.Types.ObjectId
  restaurantId: Schema.Types.ObjectId
  commandId: Schema.Types.ObjectId
  response: Array<ISatisfactionFormFields>
  version: number
}

// Restaurant form interface
export interface SatisfactionForm {
  version: number
  template: Array<ISatisfactionFormFields>
}


export const satisfactionFormFieldsSchemaType = new Schema<ISatisfactionFormFieldsModel>({
  fieldId:{ type: Schema.Types.ObjectId },
  fieldName: {
    type: String
  }, 
  type: {
    type: String,
    enum: fieldTypes,
  },
  required: {type: Boolean},
  result:{type: String}
})

export const satisfactionFormFieldsSchema = mongoose.model("satisfactionFormFieldsSchema", satisfactionFormFieldsSchemaType)




export interface SatisfactionFormDocument extends Document, SatisfactionForm {}
export type SatisfactionFormModel = Model<SatisfactionFormDocument>;


export const satisfactionFormSchemaType = new Schema<SatisfactionFormModel>({
  version: {type: Number},
  template: [satisfactionFormFieldsSchemaType],
})

export const satisfactionFormSchema = mongoose.model("satisfactionForm", satisfactionFormSchemaType);


export interface ClientSatisfactionFormDocument extends Document, ClientSatisfactionForm {}

export const clientSatisfactionFormSchemaType = new Schema({
  userId: {
    type: Schema.Types.ObjectId, 
    ref: "User"
  }, 
  restaurantId:{
    type: Schema.Types.ObjectId,
    ref: "Restaurant"
  }, 
  commandId: {
    type: Schema.Types.ObjectId,
    ref: "Command"
  },
  response:[satisfactionFormFieldsSchemaType],
  version: {type: Number, default:0}
})

export const clientSatisfactionFormSchema = mongoose.model("clientSatisfactionForm", clientSatisfactionFormSchemaType);


