// src/services/UsersService.js
import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt'; // Library untuk hashing password
import InvariantError from '../exceptions/InvariantError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import AuthenticationError from '../exceptions/AuthenticationError.js';

class UsersService {
  constructor() {
    this._pool = new Pool();
    console.log('UsersService dimuat');
  }

  /**
   * Menambahkan user baru ke database.
   * @param {object} payload - Objek yang berisi username, password, dan fullname.
   * @returns {Promise<string>} ID user yang baru dibuat.
   * @throws {InvariantError} Jika username sudah digunakan.
   */
  async addUser({ username, password, fullname }) {
    // 1. Verifikasi ketersediaan username
    await this.verifyNewUsername(username);

    // 2. Hashing password
    // Catatan: Cost factor 10 adalah nilai yang umum digunakan dan cukup aman.
    const hashedPassword = await bcrypt.hash(password, 10); 
    
    // 3. Generate ID dan waktu saat ini
    const id = `user-${nanoid(16)}`; 
    
    // 4. Insert data user ke tabel users
    const query = {
      text: 'INSERT INTO users (id, username, password, fullname) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    return result.rows[0].id;
  }

  /**
   * Mengambil data user berdasarkan ID.
   * @param {string} userId - ID pengguna.
   * @returns {Promise<object>} Objek user (id, username, fullname).
   * @throws {NotFoundError} Jika user tidak ditemukan.
   */
  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }

  /**
   * Memverifikasi apakah username sudah digunakan.
   * @param {string} username - Username yang akan diverifikasi.
   * @returns {Promise<void>}
   * @throws {InvariantError} Jika username sudah ada.
   */
  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  /**
   * Memverifikasi kredensial user untuk proses login/autentikasi.
   * @param {string} username - Username.
   * @param {string} password - Password yang belum di-hash.
   * @returns {Promise<string>} ID user jika kredensial valid.
   * @throws {AuthenticationError} Jika username tidak ditemukan atau password salah.
   */
  async verifyUserCredential(username, password) {
    // 1. Dapatkan user berdasarkan username
    const userQuery = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(userQuery);

    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    // 2. Bandingkan password yang diberikan dengan password yang di-hash
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }
    
    return id;
  }
}

export default UsersService;