const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(playlistsService, ProducerService, validator) {
    this._playlistsService = playlistsService;
    this._producerService = ProducerService;
    this._validator = validator;
    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    this._validator.validateExportParam(request.params);

    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);

    const message = {
      targetPlaylist: id,
      targetEmail: request.payload.targetEmail,
    };

    await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
