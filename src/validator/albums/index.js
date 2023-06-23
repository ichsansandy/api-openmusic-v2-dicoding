const { AlbumPayloadSchema, AlbumParamSchema, ImageHeadersSchema } = require('./albumSchema');
const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

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
  validateAlbumCoverImage: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
