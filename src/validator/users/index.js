// src/validator/users/index.js
import InvariantError from '../../exceptions/InvariantError.js';
import UserSchema from './schema.js'; // Mengimpor skema validasi Joi

const UserValidator = {
  /**
   * Memvalidasi payload untuk permintaan POST /users (Registrasi User).
   * Payload: { username, password, fullname }
   * @param {object} payload - Data yang akan divalidasi.
   * @throws {InvariantError} Jika payload tidak valid (melanggar skema).
   */
  validateUserPayload: (payload) => {
    // Memastikan skema untuk PostUserPayloadSchema tersedia
    const validationResult = UserSchema.PostUserPayloadSchema.validate(payload);

    if (validationResult.error) {
      // Melemparkan InvariantError jika validasi gagal
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default UserValidator;