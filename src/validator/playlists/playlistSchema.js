const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
  owner: Joi.string().required(),
});

const PlaylistParamSchema = Joi.object({
  id: Joi.string().min(24).required(),
});

module.exports = { PlaylistPayloadSchema, PlaylistParamSchema };
