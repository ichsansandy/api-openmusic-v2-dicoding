const autoBind = require('auto-bind');

class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { title, year, genre, performer, duration, albumId } = request.payload;
    const songId = await this._service.addNewSong(title, year, genre, performer, duration, albumId);
    const response = h.response({
      status: 'success',
      message: 'New Song Created',
      data: {
        songId: songId,
      },
    });
    response.code(201);
    return response;
  }

  async getAllSongHandler(request) {
    const { title, performer } = request.query;
    let songs;

    if (title && !performer) {
      songs = await this._service.getSongByTitle(title);
    } else if (!title && performer) {
      songs = await this._service.getSongByPerformer(performer);
    } else if (title && performer) {
      songs = await this._service.getSongByTitleAndPerformer(title, performer);
    } else {
      songs = await this._service.getAllSong(title, performer);
    }

    return {
      status: 'success',
      data: { songs },
    };
  }
  async getSongByIdHandler(request) {
    this._validator.validateSongParam(request.params);
    const { id } = request.params;
    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: { song },
    };
  }
  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    this._validator.validateSongParam(request.params);
    const { title, year, genre, performer, duration, albumId } = request.payload;
    const { id } = request.params;
    await this._service.editSong(id, title, year, genre, performer, duration, albumId);
    return {
      status: 'success',
      message: 'Edit Song Success',
    };
  }
  async deleteSongByHandler(request) {
    this._validator.validateSongParam(request.params);
    const { id } = request.params;
    await this._service.deleteSong(id);
    return {
      status: 'success',
      message: 'Delete Song Success',
    };
  }
}

module.exports = SongHandler;
