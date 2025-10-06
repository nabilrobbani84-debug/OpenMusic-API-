// src/api/albums/validator.js (Diperbaiki)
import InvariantError from '../../exceptions/InvariantError.js';
// Menggunakan named import dari schema.js yang sudah benar
import { AlbumPayloadSchema } from '../../validator/albums/schema.js'; 

const AlbumsValidator = {
  validateAlbumPayload(payload) {
    const validationResult = AlbumPayloadSchema.validate(payload);
 
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};
 
export default AlbumsValidator; 