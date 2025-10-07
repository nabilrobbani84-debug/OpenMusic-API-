// src/api/collaborations/index.js (Perbaikan)
import CollaborationsHandler from './handler.js';
import routes from './routes.js';

const collaborations = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, options) => {
    // Inisialisasi Handler dengan semua dependency
    const collaborationsHandler = new CollaborationsHandler(
      options.collaborationsService, 
      options.playlistsService, 
      options.validator
    );
    server.route(routes(collaborationsHandler));
    console.log('Plugin Collaborations terdaftar');
  },
};

export default collaborations;  