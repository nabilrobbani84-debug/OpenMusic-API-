// src/api/users/routes.js
const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler, // Rute untuk registrasi user baru
  },

  {
    method: 'GET',
    path: '/users/{id}',
    handler: handler.getUserByIdHandler,
    // Note: Anda mungkin ingin menambahkan auth: 'openmusic_jwt' di sini
  },
  
];

export default routes;