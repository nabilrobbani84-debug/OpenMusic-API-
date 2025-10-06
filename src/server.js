// nabilrobbani84-debug/openmusic-api-/OpenMusic-API--ab944dbaeb9d0fd8c572bca07d36672053ff1850/src/server.js (Modified)
import 'dotenv/config.js'; // Pastikan baris ini ada di paling atas
import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt'; // Ditambahkan
import albums from './api/albums/index.js';
import songs from './api/songs/index.js';
// Ditambahkan: Import plugins baru
import users from './api/users/index.js'; 
import authentications from './api/authentications/index.js';
import playlists from './api/playlists/index.js';
// Ditambahkan untuk kriteria opsional (Kolaborasi/Aktivitas)
import collaborations from './api/collaborations/index.js'; 

// Ditambahkan: Import services/utils/validators baru (asumsi file ini telah Anda buat)
import UsersService from './services/UsersService.js';
import AuthenticationsService from './services/AuthenticationsService.js';
import CollaborationsService from './services/CollaborationsService.js'; // Ditambahkan
import ActivitiesService from './services/ActivitiesService.js'; // Ditambahkan
import PlaylistsService from './services/PlaylistsService.js';
import TokenManager from './utils/TokenManager.js';
import UserValidator from './validator/users/index.js';
import AuthenticationValidator from './validator/authentications/index.js';
import PlaylistValidator from './validator/playlists/index.js';
import CollaborationValidator from './validator/collaborations/index.js'; // Ditambahkan
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
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  
  // Inisialisasi Services yang mendukung Playlists
  const collaborationsService = new CollaborationsService();
  const activitiesService = new ActivitiesService();
  const playlistsService = new PlaylistsService(collaborationsService, activitiesService); 
  
  // Register JWT Plugin (Kriteria 1)
  await server.register([
    {
      plugin: Jwt,
    }
  ]);

  // Definisikan JWT Authentication Strategy (Kriteria 1)
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY, // Kriteria 1: Menggunakan ACCESS_TOKEN_KEY
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => {
      // Pastikan payload memiliki userId (Kriteria 1)
      const { userId } = artifacts.decoded.payload;
      return {
        isValid: true,
        credentials: {
          id: userId, // Mengambil userId dari payload untuk credential
        },
      };
    },
  });

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
    // Ditambahkan: Plugins baru
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistValidator,
        songsService: songsService, 
      },
    },
    // Ditambahkan: Plugin untuk Kolaborasi (Kriteria Opsional 1)
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Client Error (4xx) (Kriteria 5)
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail', // Menggunakan status 'fail' untuk 4xx
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // Server Error (500) (Kriteria 5)
    if (response && response.isServer) {
      // Menambahkan logging error server untuk debugging
      console.error(response); 
      const newResponse = h.response({
        status: 'error', // Menggunakan status 'error' untuk 500
        message: 'Terjadi kegagalan pada server kami',
      });
      newResponse.code(500); // Menggunakan status code 500
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

  const startPort = Number(process.env.PORT) || 5001;
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