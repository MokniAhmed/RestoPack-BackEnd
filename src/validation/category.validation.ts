const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

export const createCategoryValidator = {
  name: Joi.string().required().min(3).max(40).alphanum(),
  meals: Joi.array().items(Joi.objectId()),
  menuId: Joi.objectId().required(),
};
export const updateCategoryValidator = {
  name: Joi.string().min(3).max(40).alphanum(),
};

export const addCategoryToMenuValidator = {
  categoryName: Joi.string().required(),
  menuId: Joi.objectId().required(),
};
export const deleteCategoryFromMenuValidator = {
  categoryId: Joi.objectId().required(),
  menuId: Joi.objectId().required(),
};
