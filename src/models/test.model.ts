import mongoose, { Schema, Model, Document } from 'mongoose';

export interface Test {
  title: string;
}

export interface TestDocument extends Document, Test {}

export type TestModel = Model<TestDocument>;

const testSchema = new Schema<TestDocument, TestModel>(
  {
    title: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Test', testSchema);
