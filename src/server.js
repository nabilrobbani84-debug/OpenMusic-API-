// src/server.js
import Hapi from '@hapi/hapi';
import albums from './api/albums/index.js';
import songs from './api/songs/index.js';
import AlbumsService from './services/AlbumsService.js';
import SongsService from './services/SongsService.js';
import AlbumValidator from './validator/albums/index.js';
import SongValidator from './validator/songs/index.js';
import ClientError from './exceptions/ClientError.js';

const createServerInstance = (host, port) => {
  return Hapi.server({
    host,
    port,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
};

const registerPluginsAndExtensions = async (server, albumsService, songsService) => {
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response && response.isServer) {
      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });
};

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const envHost = process.env.HOST;
  const hosts = envHost
    ? [envHost]
    : ['127.0.0.1', 'localhost', '::1', '0.0.0.0'];

  const startPort = Number(process.env.PORT) || 5000;
  const maxPortOffset = 20;

  for (const host of hosts) {
    for (let offset = 0; offset <= maxPortOffset; offset++) {
      const port = startPort + offset;
      const server = createServerInstance(host, port);
      try {
        await registerPluginsAndExtensions(server, albumsService, songsService);
        await server.start();

        console.log(`✅ Server berjalan pada ${server.info.uri}`);

        const shutdown = async () => {
          console.log('🛑 Stopping server...');
          try {
            await server.stop({ timeout: 10000 });
            console.log('✅ Server stopped.');
            process.exit(0);
          } catch (err) {
            console.error('❌ Error when stopping server:', err);
            process.exit(1);
          }
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

        return;
      } catch (err) {
        try {
          await server.stop({ timeout: 0 });
        } catch (_) {
          // ignore
        }

        if (err && (err.code === 'EACCES' || err.code === 'EADDRINUSE')) {
          console.warn(
            `⚠️  Gagal bind ${host}:${port} — ${err.code}. Mencoba kombinasi host/port lain...`
          );
          continue;
        }

        console.error('❌ Error saat memulai server:', err);
        throw err;
      }
    }
  }

  console.error('❌ Gagal memulai server setelah mencoba beberapa host dan port.');
  console.error(
    'Coba jalankan sebagai Administrator, atau ubah HOST ke 127.0.0.1, atau gunakan port lain.'
  );
  process.exit(1);
};

init().catch((err) => {
  console.error('❌ Inisialisasi server gagal:', err);
  process.exit(1);
});