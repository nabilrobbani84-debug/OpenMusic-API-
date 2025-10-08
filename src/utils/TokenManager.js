// src/utils/TokenManager.js (New File)
import Jwt from '@hapi/jwt'; // Asumsi JWT sudah di-import di server
import InvariantError from '../exceptions/InvariantError.js';

const TokenManager = {
  // Asumsi fungsi-fungsi ini dipanggil di luar konteks Request Hapi
  // dan membutuhkan referensi global/impor langsung dari @hapi/jwt

  generateAccessToken: (payload) => {
    // Kriteria 1: Menggunakan ACCESS_TOKEN_KEY
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY); 
  },
  generateRefreshToken: (payload) => {
    // Kriteria 1: Menggunakan REFRESH_TOKEN_KEY
    return Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY);
  },
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      // Kriteria 1: Verifikasi dengan REFRESH_TOKEN_KEY
      Jwt.token.verify(artifacts, process.env.REFRESH_TOKEN_KEY); 
      
      // PERBAIKAN: Mengakses artifacts.decoded.payload
      return artifacts.decoded.payload; 
    } catch (error) {
      // Kriteria 5: Invalid Refresh Token (400 Bad Request)
      throw new InvariantError('Refresh token tidak valid'); 
    }
  },
};

export default TokenManager;