// src/api/playlists/index.js (Perbaikan)
import PlaylistsHandler from './handler.js';
import routes from './routes.js';

const playlists = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, options) => {
    // Inisialisasi Handler dengan semua dependency
    const playlistsHandler = new PlaylistsHandler(options.service, options.validator, options.songsService);
    server.route(routes(playlistsHandler));
    console.log('Plugin Playlists terdaftar');
  },
};

export default playlists;