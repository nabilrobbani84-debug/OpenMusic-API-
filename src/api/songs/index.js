// src/api/songs/index.js

// Import SongsHandler from file handler.js
const SongsHandler = require('./handler');

// Import routes from file routes.js
const routes = require('./routes');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    // Create instance of SongsHandler with injected service and validator
    const songsHandler = new SongsHandler(service, validator);

    // Register all routes returned by the routes function
    server.route(routes(songsHandler));
  },
};
