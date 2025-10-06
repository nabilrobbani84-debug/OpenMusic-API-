// src/validator/playlists/index.js
import InvariantError from '../../exceptions/InvariantError.js';
import PlaylistSchema from './schema.js'; // Mengimpor skema validasi Joi

const PlaylistValidator = {
  /**
   * Memvalidasi payload untuk permintaan POST /playlists (Membuat Playlist).
   * Payload: { name }
   * @param {object} payload - Data yang akan divalidasi.
   * @throws {InvariantError} Jika payload tidak valid.
   */
  validatePlaylistPayload: (payload) => {
    // Memastikan skema untuk PostPlaylistPayloadSchema tersedia
    const validationResult = PlaylistSchema.PostPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      // Melemparkan InvariantError jika validasi gagal
      throw new InvariantError(validationResult.error.message);
    }
  },

  /**
   * Memvalidasi payload untuk permintaan POST /playlists/{playlistId}/songs (Menambahkan Lagu).
   * Payload: { songId }
   * @param {object} payload - Data yang akan divalidasi.
   * @throws {InvariantError} Jika payload tidak valid.
   */
  validatePlaylistSongPayload: (payload) => {
    const validationResult = PlaylistSchema.PostPlaylistSongPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default PlaylistValidator;