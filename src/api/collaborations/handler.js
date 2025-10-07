// src/api/collaborations/handler.js
import autoBind from 'auto-bind';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import AuthorizationError from '../../exceptions/AuthorizationError.js';

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  // POST /collaborations
  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);
      const { playlistId, userId } = request.payload;
      const { id: ownerId } = request.auth.credentials;

      // 1. Verifikasi bahwa yang menambahkan kolaborator adalah pemilik playlist
      await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

      // 2. Tambahkan kolaborasi (service akan memvalidasi eksistensi user/playlist dan duplikasi)
      const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
        },
      });
      response.code(201);
      return response;

    } catch (error) {
      if (error instanceof InvariantError || error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      throw error;
    }
  }

  // DELETE /collaborations
  async deleteCollaborationHandler(request) {
    try {
      this._validator.validateCollaborationPayload(request.payload);
      const { playlistId, userId } = request.payload;
      const { id: ownerId } = request.auth.credentials;

      // 1. Verifikasi bahwa yang menghapus kolaborator adalah pemilik playlist
      await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

      // 2. Hapus kolaborasi
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      throw error;
    }
  }
}

export default CollaborationsHandler;