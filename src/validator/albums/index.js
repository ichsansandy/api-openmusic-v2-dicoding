const { AlbumPayloadSchema, AlbumParamSchema } = require('./albumSchema');
const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new ClientError(validationResult.error.message);
    }
  },
  validateAlbumParam: (param) => {
    const validationResult = AlbumParamSchema.validate(param);
    if (validationResult.error) {
      throw new NotFoundError(validationResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
