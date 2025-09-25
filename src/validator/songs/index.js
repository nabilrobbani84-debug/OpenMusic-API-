// src/validator/songs/index.js (Contoh Perbaikan)

import InvariantError from '../../exceptions/InvariantError.js';
import { SongPayloadSchema } from './schema.js';

const SongsValidator = {
  validateSongPayload: (payload) => {
    // 1. Validasi keberadaan payload
    if (!payload) {
        throw new InvariantError('Gagal memvalidasi lagu. Payload tidak boleh kosong.');
    }

    // 2. Lakukan validasi menggunakan Joi
    const validationResult = SongPayloadSchema.validate(payload);

    // 3. Tangani hasil validasi
    if (validationResult.error) {
      // Joi akan melempar error jika ada properti yang tidak valid
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default SongsValidator;