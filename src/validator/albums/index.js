// src/validator/albums/index.js

import InvariantError from '../../exceptions/InvariantError.js';
import { AlbumPayloadSchema } from './schema.js'; // <-- Named Import

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    // Tambahkan Pengecekan Payload Eksplisit (Opsional, tapi Aman)
    if (!payload || typeof payload !== 'object') {
        throw new InvariantError('Gagal memvalidasi album. Payload request tidak valid.');
    }
    
    const validationResult = AlbumPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default AlbumsValidator;