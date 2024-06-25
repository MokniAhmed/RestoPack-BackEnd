const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

export const createMealValidation = {
  name: Joi.string().required().min(3).max(40),
  price: Joi.number().required(),
  restaurantId: Joi.objectId().required(),
  ingredients: Joi.array().required().items(Joi.objectId()),
  image: Joi.string(),
  imageUrl: Joi.string().uri(),
};
export const updateMealValidation = {
  name: Joi.string().min(3).max(40),
  price: Joi.number(),
  ingredients: Joi.array().required().items(Joi.objectId()),
};

export const addMealToCategoryValidation = {
  categoryId: Joi.objectId().required(),
  mealIdsList: Joi.array().items(Joi.objectId()),
};
export const deleteMealFromCategoryValidation = {
  categoryId: Joi.objectId().required(),
  mealId: Joi.objectId().required(),
};
