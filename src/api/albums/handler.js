const autoBind = require('auto-bind');

class AlbumHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addNewAlbum(name, year);

    const response = h.response({
      status: 'success',
      message: 'New Album Created',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    this._validator.validateAlbumParam(request.params);

    const { id } = request.params;
    let album = await this._service.getAlbumById(id);

    const songs = await this._service.getSongByAlbumId(id);
    album = {
      ...album,
      songs,
    };
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    this._validator.validateAlbumParam(request.params);
    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.editAlbum(id, name, year);

    return {
      status: 'success',
      message: 'Edit Album Success',
    };
  }

  async deleteAlbumByIdHandler(request) {
    this._validator.validateAlbumParam(request.params);
    const { id } = request.params;
    await this._service.deleteAlbum(id);

    return {
      status: 'success',
      message: 'Delete Album Success',
    };
  }
}

module.exports = AlbumHandler;
