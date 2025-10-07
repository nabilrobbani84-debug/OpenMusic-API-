// src/api/authentications/handler.js
import autoBind from 'auto-bind';
import AuthenticationError from '../../exceptions/AuthenticationError.js';
import InvariantError from '../../exceptions/InvariantError.js';

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  // POST /authentications - Login
  async postAuthenticationHandler(request, h) {
    try {
      this._validator.validatePostAuthenticationPayload(request.payload);
      const { username, password } = request.payload;

      const userId = await this._usersService.verifyUserCredential(username, password);

      const accessToken = this._tokenManager.generateAccessToken({ userId });
      const refreshToken = this._tokenManager.generateRefreshToken({ userId });

      await this._authenticationsService.addRefreshToken(refreshToken);

      const response = h.response({
        status: 'success',
        data: {
          accessToken,
          refreshToken,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof InvariantError) {
        throw error; // Biarkan global handler menangani 401 dan 400
      }
      throw error; // Biarkan global handler menangani 500
    }
  }

  // PUT /authentications - Refresh Token
  async putAuthenticationHandler(request, h) {
    try {
      this._validator.validatePutAuthenticationPayload(request.payload);
      const { refreshToken } = request.payload;

      // 1. Verifikasi Refresh Token (dari JWT)
      const { userId } = this._tokenManager.verifyRefreshToken(refreshToken); 
      
      // 2. Verifikasi Refresh Token (dari Database)
      await this._authenticationsService.verifyRefreshToken(refreshToken);

      // 3. Generate Access Token Baru
      const accessToken = this._tokenManager.generateAccessToken({ userId });

      return {
        status: 'success',
        data: {
          accessToken,
        },
      };
    } catch (error) {
      // InvariantError (400) dari validator, verifyRefreshToken DB, atau verifyRefreshToken JWT
      if (error instanceof InvariantError) { 
        throw error; 
      }
      throw error;
    }
  }

  // DELETE /authentications - Logout
  async deleteAuthenticationHandler(request) {
    try {
      this._validator.validateDeleteAuthenticationPayload(request.payload);
      const { refreshToken } = request.payload;

      // Hapus token dari DB
      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return {
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      };
    } catch (error) {
      // InvariantError (400) dari validator atau deleteRefreshToken (jika token tidak ada)
      if (error instanceof InvariantError) { 
        throw error; 
      }
      throw error;
    }
  }
}

export default AuthenticationsHandler;