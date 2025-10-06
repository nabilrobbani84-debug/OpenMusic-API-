// src/services/AuthenticationsService.js
import { Pool } from 'pg';
import InvariantError from '../exceptions/InvariantError.js';

class AuthenticationsService {
  constructor() {
    // Inisialisasi koneksi database Pool
    this._pool = new Pool();
    console.log('AuthenticationsService dimuat');
  }

  /**
   * Menyimpan refresh token ke dalam tabel authentications.
   * @param {string} token - Refresh token yang akan disimpan.
   * @returns {Promise<void>}
   */
  async addRefreshToken(token) {
    const query = {
      // Asumsi tabel authentications memiliki kolom 'token' (TEXT)
      text: 'INSERT INTO authentications VALUES($1)', 
      values: [token],
    };

    await this._pool.query(query);
  }

  /**
   * Memverifikasi apakah refresh token valid (ada di database).
   * @param {string} token - Refresh token yang akan diverifikasi.
   * @returns {Promise<void>}
   * @throws {InvariantError} Jika refresh token tidak ditemukan.
   */
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);

    // Jika token tidak ada di database, lempar InvariantError
    if (!result.rowCount) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  /**
   * Menghapus refresh token dari database (misalnya saat logout).
   * @param {string} token - Refresh token yang akan dihapus.
   * @returns {Promise<void>}
   */
  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    await this._pool.query(query);
  }
}

export default AuthenticationsService;