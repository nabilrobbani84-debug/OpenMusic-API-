// src/api/albums/index.js

// Impor AlbumsHandler dari file handler.js
const AlbumsHandler = require('./handler');

// Impor routes dari file routes.js
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    // Buat instance AlbumsHandler dengan service dan validator yang diinjeksi
    const albumsHandler = new AlbumsHandler(service, validator);

    // Daftarkan semua rute yang dikembalikan oleh fungsi routes
    server.route(routes(albumsHandler));
  },
};