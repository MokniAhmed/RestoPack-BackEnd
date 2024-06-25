import joi from "joi";

export const superVerifyRestaurantValidator = {
  isActive: joi.boolean().equal(true),
  isVerified: joi.boolean().equal(true),
};

export const createRestaurantValidator = {
  email: joi.string().email({ minDomainSegments: 2 }).required(),
  name: joi.string().min(1).max(50).required(),
  location: joi.string().required(),
  phone: joi.string().length(8).pattern(/^[0-9]+$/).required(),
};
