const { UserPayloadSchema, UserParamSchema } = require('./userSchema');
const InvariantError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');

const UserValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUserParam: (param) => {
    const validationResult = UserParamSchema.validate(param);
    if (validationResult.error) {
      throw new NotFoundError(validationResult.error.message);
    }
  },
};

module.exports = UserValidator;
