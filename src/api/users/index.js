// import UsersHandler from './handler.js';
// import routes from './routes.js';

const users = {
  name: 'users',
  version: '1.0.0',
  register: async (server, options) => {
    // const usersHandler = new UsersHandler(options.service, options.validator);
    // server.route(routes(usersHandler));
    console.log('Plugin Users terdaftar (skeleton)');
  },
};

export default users;