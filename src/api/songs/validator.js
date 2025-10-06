// src/api/songs/validator.js (Diperbaiki)
import InvariantError from '../../exceptions/InvariantError.js';
// Menggunakan named import dari schema.js yang sudah benar
import { SongPayloadSchema } from '../../validator/songs/schema.js'; 
 
const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
 
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};
 
export default SongsValidator; 