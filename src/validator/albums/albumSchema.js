const Joi = require('joi');

const currentYear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear).required(),
});

const AlbumParamSchema = Joi.object({
  id: Joi.string().min(22).required(),
});

module.exports = { AlbumPayloadSchema, AlbumParamSchema };
