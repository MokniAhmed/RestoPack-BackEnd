const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

export const createMenuValidator = {
  saison: Joi.string().required().min(3).max(40).alphanum(),
  restaurantId: Joi.objectId().required(),
  categories: Joi.array().required(false).items(Joi.objectId()),
};
export const updateMenuValidator = {
  name: Joi.string().min(3).max(40).alphanum(),
  price: Joi.number(),
};
