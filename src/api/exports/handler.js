class ExportsHandler {
  constructor(playlistsService, exportsService, validator) {
    this._playlistsService = playlistsService;
    this._exportsService = exportsService;
    this._validator = validator;
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    this._validator.validateExportParam(request.params);
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    this._playlistsService.verifyPlaylistOwner(id, credentialId);

    const message = {
      userId: credentialId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
