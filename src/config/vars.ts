import { config } from "dotenv";

config();

export const env = process.env.NODE_ENV;
export const port = process.env.PORT;
export const mongoUri = process.env.MONGO_URI as string;
export const clientUrl = process.env.CLIENT_URL;
export const serverUrl = process.env.SERVER;
export const accessSecret = process.env.ACCESS_SECRET as string;
export const expirationInterval = Number(process.env.JWT_EXPIRATION_MINUTES);
export const email = process.env.EMAIL;
export const password = process.env.PASSWORD;
export const CloudinaryApiName = process.env.CLOUDINARY_NAME || '';
export const CloudinaryApiKey = process.env.CLOUDINARY_API_KEY || '';
export const CloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || '';