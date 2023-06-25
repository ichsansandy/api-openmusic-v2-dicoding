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

  async postUploadAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
    console.log(cover);
    this._validator.validateAlbumCoverImage(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/albums-cover/${filename}`;

    await this._service.editCoverAlbum(coverUrl, id);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikesHandler(request, h) {
    this._validator.validateAlbumParam(request.params);

    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.addLikeToAlbum(id, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikesHandler(request) {
    this._validator.validateAlbumParam(request.params);

    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.unLikeAlbum(id, credentialId);

    return {
      status: 'success',
      message: 'Delete Album Success',
    };
  }

  async getAlbumLikesHandler(request, h) {
    this._validator.validateAlbumParam(request.params);

    const { id } = request.params;

    const result = await this._service.getAlbumLike(id);

    const likes = result.data.likes;
    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    if (result.cache === true) response.header('X-Data-Source', 'cache');
    return response;
  }
}

module.exports = AlbumHandler;
