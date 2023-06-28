const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.postCollaboratorHandler,
    options: {
      auth: 'playlist_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaboratorHandler,
    options: {
      auth: 'playlist_jwt',
    },
  },
];

module.exports = routes;
