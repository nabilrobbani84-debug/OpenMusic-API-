// src/api/users/routes.js
const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler, 
  },

  {
    method: 'GET',
    path: '/users/{id}',
    handler: handler.getUserByIdHandler,
    options: {
      auth: 'openmusic_jwt', 
    },
  },

];

export default routes;