// src/api/albums/index.js

// Impor AlbumsHandler dari file handler.js
import AlbumsHandler from './handler.js';

// Impor routes dari file routes.js
import routes from './routes.js';

const albumsPlugin = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    // Buat instance AlbumsHandler dengan service dan validator yang diinjeksi
    const albumsHandler = new AlbumsHandler(service, validator);

    // Daftarkan semua rute yang dikembalikan oleh fungsi routes
    server.route(routes(albumsHandler));
  },
};

export default albumsPlugin;