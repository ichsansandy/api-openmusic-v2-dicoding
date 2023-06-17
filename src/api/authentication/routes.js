const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler,
  },
  {
    method: 'PUT',
    path: '/authentications/{id}',
    handler: handler.putAuthenticationByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/authentications/{id}',
    handler: handler.deleteAuthenticationByIdHandler,
  },
];

module.exports = routes;
