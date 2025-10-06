// src/validator/authentications/index.js
import InvariantError from '../../exceptions/InvariantError.js';
import AuthenticationSchema from './schema.js'; // Mengimpor skema validasi Joi

const AuthenticationValidator = {
  /**
   * Memvalidasi payload untuk permintaan POST /authentications (Login).
   * Payload: { username, password }
   * @param {object} payload - Data yang akan divalidasi.
   * @throws {InvariantError} Jika payload tidak valid.
   */
  validatePostAuthenticationPayload: (payload) => {
    // Memastikan skema untuk PostAuthenticationPayload tersedia
    const validationResult = AuthenticationSchema.PostAuthenticationPayloadSchema.validate(payload);

    if (validationResult.error) {
      // Melemparkan InvariantError jika validasi gagal
      throw new InvariantError(validationResult.error.message); 
    }
  },

  /**
   * Memvalidasi payload untuk permintaan PUT /authentications (Update refresh token).
   * Payload: { refreshToken }
   * @param {object} payload - Data yang akan divalidasi.
   * @throws {InvariantError} Jika payload tidak valid.
   */
  validatePutAuthenticationPayload: (payload) => {
    const validationResult = AuthenticationSchema.PutAuthenticationPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  /**
   * Memvalidasi payload untuk permintaan DELETE /authentications (Logout).
   * Payload: { refreshToken }
   * @param {object} payload - Data yang akan divalidasi.
   * @throws {InvariantError} Jika payload tidak valid.
   */
  validateDeleteAuthenticationPayload: (payload) => {
    const validationResult = AuthenticationSchema.DeleteAuthenticationPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default AuthenticationValidator;