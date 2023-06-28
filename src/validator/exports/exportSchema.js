const Joi = require('joi');

const ExportPlaylistsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

const ExportPlaylistsParamSchema = Joi.object({
  id: Joi.string().min(21).required(),
});

module.exports = { ExportPlaylistsPayloadSchema, ExportPlaylistsParamSchema };
