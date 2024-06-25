import { join } from "lodash";

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

export const registerValidator = {
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(7).max(30).required(),
  fullName: Joi.string().min(1).max(50).required(),
};

export const loginValidator = {
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(7).max(30).required(),
};
export const updateUserValidator = {
  phone: Joi.string()
    .length(8)
    .pattern(/^[0-9]+$/),
  adress: Joi.string().max(130),
  role: Joi.string().required(),
  fullName: Joi.string().min(1).max(50),
  image: Joi.string()
};
export const updatePasswordValidator = {
  password: Joi.string().min(7).max(30).required(),
};

export const superAssignRoleValidator = {
  role: Joi.string().required().valid("user", "admin"),
};

export const refreshValidator = {
  refreshToken: Joi.string().required(),
};
export const resetPasswordValidator = {
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
};

export const assignEmployeRoleValidator = {
  employeeId: Joi.objectId(),
  restaurantId: Joi.objectId(),
  role: Joi.string().required().valid("user", "owner", "server", "cook"),
};

export const createNewEmployeeValidator = {
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(7).max(30).required(),
  fullName: Joi.string().min(1).max(50).required(),
  adress: Joi.string().min(1).max(150).required(),
  phone: Joi.string()
    .length(8)
    .pattern(/^[0-9]+$/),
  role: Joi.string().required().valid("owner", "server", "cook"),
};
