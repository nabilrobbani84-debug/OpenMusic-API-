// src/api/songs/routes.js
const routes = (handler) => [
  {
    // Rute untuk menambahkan lagu baru
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler,
  },
  {
    // Rute untuk mendapatkan seluruh daftar lagu
    method: 'GET',
    path: '/songs',
    handler: handler.getSongsHandler,
  },
  {
    // Rute untuk mendapatkan detail lagu berdasarkan ID
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongByIdHandler,
  },
  {
    // Rute untuk memperbarui data lagu berdasarkan ID
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHandler,
  },
  {
    // Rute untuk menghapus lagu berdasarkan ID
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHandler,
  },
];

export default routes;