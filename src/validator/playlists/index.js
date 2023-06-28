const { PlaylistPayloadSchema, PlaylistParamSchema, PlaylistSongPayloadSchema } = require('./playlistSchema');
const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new ClientError(validationResult.error.message);
    }
  },
  validatePlaylistSongPayload: (payload) => {
    const validaionResult = PlaylistSongPayloadSchema.validate(payload);
    if (validaionResult.error) {
      throw new ClientError(validaionResult.error.message);
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
