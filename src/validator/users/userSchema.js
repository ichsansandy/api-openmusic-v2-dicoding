const Joi = require('joi');


const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

const UserParamSchema = Joi.object({
  id: Joi.string().min(20).required(),
});

module.exports = { UserPayloadSchema, UserParamSchema };
