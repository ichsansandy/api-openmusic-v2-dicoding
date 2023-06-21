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

    const ownPlaylists = await this._service.getPlaylistByOwner(credentialId);
    const collabPlaylists = await this._service.getPlaylistCollab(credentialId);

    const playlists = ownPlaylists.concat(collabPlaylists);

    return {
      status: 'success',
      data: { playlists },
    };
  }

  async getPlaylistByIdHandler(request) {
    this._validator.validatePlaylistParam(request.params);
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._service.verifyPlaylistAccess(id, credentialId);
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
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;

    const { id } = request.params;
    const { songId } = request.payload;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.verifySong(songId);

    const username = await this._service.getUsernameById(credentialId);
    const songTitle = await this._service.getSongTitle(songId);
    await this._service.addSongToPlaylist(id, songId);

    const time = new Date();

    await this._service.recordActivities(id, username.username, songTitle, 'add', time);
    const response = h.response({
      status: 'success',
      message: 'Song successfully added to playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongHandler(request) {
    this._validator.validatePlaylistParam(request.params);
    const { id: credentialId } = request.auth.credentials;

    const { id } = request.params;
    await this._service.verifyPlaylistAccess(id, credentialId);

    const playlist = await this._service.getPlaylistById(id);
    const username = await this._service.getUsernameById(playlist.owner);
    const songs = await this._service.getSongInPlaylist(id);

    const result = {
      id: playlist.id,
      name: playlist.name,
      username: username.username,
      songs,
    };

    return {
      status: 'success',
      data: {
        playlist: result,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.validatePlaylistParam(request.params);
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;

    const { id } = request.params;
    const { songId } = request.payload;
    await this._service.verifyPlaylistAccess(id, credentialId);

    await this._service.deleteSongFromPlaylist(id, songId);
    const username = await this._service.getUsernameById(credentialId);
    const songTitle = await this._service.getSongTitle(songId);
    const time = new Date();
    await this._service.recordActivities(id, username.username, songTitle, 'delete', time);

    return {
      status: 'success',
      message: 'Successfuly delete song from playlist',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    this._validator.validatePlaylistParam(request.params);

    const { id: credentialId } = request.auth.credentials;

    const { id } = request.params;
    await this._service.verifyPlaylistAccess(id, credentialId);

    const activities = await this._service.getActivitiesInPlaylist(id);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistHandler;
