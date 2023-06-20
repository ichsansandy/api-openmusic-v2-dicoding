const { PlaylistPayloadSchema, PlaylistParamSchema } = require('./playlistSchema');
const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new ClientError(validationResult.error.message);
    }
  },
  validatePlaylistParam: (param) => {
    const validationResult = PlaylistParamSchema.validate(param);
    if (validationResult.error) {
      throw new NotFoundError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
