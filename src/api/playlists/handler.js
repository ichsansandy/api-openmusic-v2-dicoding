const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addNewPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      message: 'New Playlist Created',
      data: {
        playlistId: playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._service.getPlaylistByOwner(credentialId);

    const username = await this._service.getUsernameById(credentialId);

    const mappedData = playlists.map((element) => {
      const item = { id: element.id, name: element.name, username: username.username };
      return item;
    });

    return {
      status: 'success',
      data: { playlists: mappedData },
    };
  }

  async getPlaylistByIdHandler(request) {
    this._validator.validatePlaylistParam(request.params);
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._service.verifyPlaylistOwner(id, credentialId);
    const playlist = await this._service.getPlaylistById(id);

    return {
      status: 'success',
      data: { playlist },
    };
  }

  async deletePlaylistHandler(request) {
    this._validator.validatePlaylistParam(request.params);
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylist(id);
    return {
      status: 'success',
      message: 'Delete Playlist Success',
    };
  }

  async postNewSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistParam(request.params);
    this._validator.validatePlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;

    const { id } = request.params;
    const { songId } = request.payload;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.verifySong(songId);

    await this._service.addSongToPlaylist(id, songId);

    const response = h.response({
      status: 'success',
      message: 'Song successfully added to playlist',
      data: {
        playlistId: playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongHandler(request) {}
  async deleteSongFromPlaylistHandler(request) {}
}

module.exports = PlaylistHandler;
