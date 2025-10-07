// src/api/users/index.js (Perbaikan)
import UsersHandler from './handler.js'; // Buat file ini
import routes from './routes.js'; // Buat file ini

const users = {
  name: 'users',
  version: '1.0.0',
  register: async (server, options) => {
    // Inisialisasi Handler dan daftarkan routes
    const usersHandler = new UsersHandler(options.service, options.validator);
    server.route(routes(usersHandler));
    console.log('Plugin Users terdaftar'); // Hapus (skeleton)
  },
};

export default users;