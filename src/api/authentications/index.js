// import AuthenticationsHandler from './handler.js';
// import routes from './routes.js';

const authentications = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, options) => {
    // const authenticationsHandler = new AuthenticationsHandler(options.authenticationsService, options.usersService, options.tokenManager, options.validator);
    // server.route(routes(authenticationsHandler));
    console.log('Plugin Authentications terdaftar (skeleton)');
  },
};

export default authentications;