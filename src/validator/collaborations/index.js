// src/validator/collaborations/index.js
import InvariantError from '../../exceptions/InvariantError.js';
import CollaborationSchema from './schema.js'; // Mengimpor skema validasi Joi

const CollaborationValidator = {
  /**
   * Memvalidasi payload untuk permintaan POST /collaborations dan DELETE /collaborations.
   * Payload: { playlistId, userId }
   * @param {object} payload - Data yang akan divalidasi.
   * @throws {InvariantError} Jika payload tidak valid.
   */
  validateCollaborationPayload: (payload) => {
    // Memastikan skema untuk CollaborationPayloadSchema tersedia
    const validationResult = CollaborationSchema.CollaborationPayloadSchema.validate(payload);

    if (validationResult.error) {
      // Melemparkan InvariantError jika validasi gagal
      throw new InvariantError(validationResult.error.message); 
    }
  },
};

export default CollaborationValidator;