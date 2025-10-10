// src/api/playlists/handler.js
import autoBind from 'auto-bind';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import AuthorizationError from '../../exceptions/AuthorizationError.js';

class PlaylistsHandler {
  constructor(service, validator, songsService, producerService) {
    this._service = service;
    this._validator = validator;
    this._songsService = songsService; // Untuk cek eksistensi songId
    this._producerService = producerService;

    autoBind(this);
  }

  async postPlaylistExportHandler(request, h) {
    try {
      this._validator.validatePlaylistExportPayload(request.payload); // Validasi Payload
      const { playlistId } = request.params;
      const { targetEmail } = request.payload;
      const { id: userId } = request.auth.credentials;
      
      // Verifikasi akses ke playlist
      await this._service.verifyPlaylistAccess(playlistId, userId);

      const message = {
        playlistId,
        targetEmail,
      };

      // Kirim pesan ke Message Broker
      await this._producerService.sendMessage('export:playlists', message); 

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
      response.code(201);
      return response;

    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError || error instanceof InvariantError) {
        throw error;
      }
      throw error;
    }
  }

  // POST /playlists
  // src/api/playlists/handler.js (Contoh Sederhana untuk postPlaylistSongHandler)
  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePostPlaylistSongPayload(request.payload);
      const { playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      const playlistSongId = await this._playlistsService.addSongToPlaylist(playlistId, songId);

      // Logging activity
      await this._activitiesService.addPlaylistSongActivity({
        playlistId,
        songId,
        userId: credentialId,
        action: 'add',
      });

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
        data: {
          playlistSongId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // GET /playlists
  async getPlaylistsHandler(request) {
    const { id: userId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(userId); 
    
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }
  
  // DELETE /playlists/{id}
  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: userId } = request.auth.credentials;

      // 1. Verifikasi Owner (hanya owner yang bisa menghapus playlist)
      await this._service.verifyPlaylistOwner(id, userId);

      // 2. Hapus Playlist
      await this._service.deletePlaylistById(id);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      // Menangani NotFoundError dan AuthorizationError
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      throw error;
    }
  }
  
  // POST /playlists/{playlistId}/songs
  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      // 1. Verifikasi akses ke playlist (owner atau collaborator)
      await this._service.verifyPlaylistAccess(playlistId, userId);
      
      // 2. Verifikasi lagu ada
      await this._songsService.getSongById(songId); 

      // 3. Tambahkan lagu ke playlist
      await this._service.addSongToPlaylist(playlistId, songId, userId);

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      });
      response.code(201);
      return response;

    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InvariantError || error instanceof AuthorizationError) {
        throw error;
      }
      throw error;
    }
  }

  // GET /playlists/{playlistId}/songs
  async getPlaylistSongsHandler(request) {
    try {
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      // 1. Verifikasi akses ke playlist (owner atau collaborator)
      await this._service.verifyPlaylistAccess(playlistId, userId);
      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

      // 2. Ambil detail playlist dan lagu-lagunya
      // const playlist = await this._service.getPlaylistSongs(playlistId);
      const playlist = await this._playlistsService.getPlaylistSongs(playlistId, credentialId);
        const response = h.response({
        status: 'success',
        data: {
          playlist,
        },
      });
      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      throw error;
    }
  }
  
  // DELETE /playlists/{playlistId}/songs
  async deletePlaylistSongHandler(request) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      // 1. Verifikasi akses ke playlist (owner atau collaborator)
      await this._service.verifyPlaylistAccess(playlistId, userId);

      // 2. Hapus lagu dari playlist
      await this._service.deleteSongFromPlaylist(playlistId, songId, userId);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      throw error;
    }
  }
  
  // GET /playlists/{playlistId}/activities
  async getPlaylistActivitiesHandler(request) {
    try {
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;
      
      // 1. Verifikasi Owner (hanya owner yang boleh melihat aktivitas)
      await this._service.verifyPlaylistOwner(playlistId, userId);
      
      // 2. Ambil aktivitas
      const activities = await this._service._activitiesService.getActivities(playlistId);

      return {
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      throw error;
    }
  }
}

export default PlaylistsHandler;