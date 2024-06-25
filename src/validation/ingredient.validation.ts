const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

export const createIngredientValidation = {
  name: Joi.string().required().min(3).max(40),
};
export const createNewIngredientToReastaurantValidation = {
  name: Joi.string().required().min(3).max(40),
  isAvailable: Joi.boolean(),
  restaurantId: Joi.objectId().required(),
  isSupplement: Joi.boolean(),
  priceSupplement: Joi.number(),
  imageUrl: Joi.string().uri(),
};
export const updateIngredientValidation = {
  name: Joi.string().min(3).max(40),
};

export const addIngredientToMealValidation = {
  ingredientId: Joi.objectId().required(),
  mealId: Joi.objectId().required(),
};
export const deleteIngredientFromMealValidation = {
  ingredientId: Joi.objectId().required(),
  mealId: Joi.objectId().required(),
};

export const deleteAllIngredientFromMealValidation = {
  mealId: Joi.objectId().required(),
};
