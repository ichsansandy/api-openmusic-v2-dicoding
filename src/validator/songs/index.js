const { SongPayloadSchema, SongParamSchema } = require('./songSchema');
const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');

const SongValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new ClientError(validationResult.error.message);
    }
  },
  validateSongParam: (param) => {
    const validationResult = SongParamSchema.validate(param);
    if (validationResult.error) {
      throw new NotFoundError(validationResult.error.message);
    }
  },
};

module.exports = SongValidator;
