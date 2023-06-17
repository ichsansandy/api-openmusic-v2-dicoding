const autoBind = require('auto-bind');

class UserHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;
    const userId = await this._service.addNewUser(username, password, fullname);
    const response = h.response({
      status: 'success',
      message: 'New User Created',
      data: {
        userId: userId,
      },
    });
    response.code(201);
    return response;
  }

  async getUserByIdHandler(request) {
    this._validator.validateUserParam(request.params);
    const { id } = request.params;
    const user = await this._service.getUserById(id);

    return {
      status: 'success',
      data: { user },
    };
  }
}

module.exports = UserHandler;
