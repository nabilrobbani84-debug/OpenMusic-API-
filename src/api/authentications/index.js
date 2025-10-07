// src/api/authentications/index.js (Perbaikan)
import AuthenticationsHandler from './handler.js';
import routes from './routes.js';

const authentications = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, options) => {
    // Inisialisasi Handler dengan semua dependency yang di-pass dari server.js
    const authenticationsHandler = new AuthenticationsHandler(
      options.authenticationsService, 
      options.usersService, 
      options.tokenManager, 
      options.validator
    );
    server.route(routes(authenticationsHandler));
    console.log('Plugin Authentications terdaftar');
  },
};

export default authentications;