// src/api/playlists/handler.js
import autoBind from 'auto-bind';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import AuthorizationError from '../../exceptions/AuthorizationError.js';

class PlaylistsHandler {
  constructor(service, validator, songsService) {
    this._service = service;
    this._validator = validator;
    this._songsService = songsService; // Untuk cek eksistensi songId

    autoBind(this);
  }

  // POST /playlists
  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: owner } = request.auth.credentials; // ID user dari JWT

      const playlistId = await this._service.addPlaylist({ name, owner });

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof InvariantError) {
        throw error;
      }
      throw error;
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
      
      // 2. Ambil detail playlist dan lagu-lagunya
      const playlist = await this._service.getPlaylistSongs(playlistId);

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