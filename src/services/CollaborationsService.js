// src/services/CollaborationsService.js
import { Pool } from 'pg';
// Import nanoid untuk generate ID unik.
import { nanoid } from 'nanoid'; 
import InvariantError from '../exceptions/InvariantError.js';
import NotFoundError from '../exceptions/NotFoundError.js'; 

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
    console.log('CollaborationsService dimuat');
  }

  /**
   * Menambahkan kolaborasi user ke sebuah playlist.
   * Melakukan pengecekan duplikasi kolaborasi dan validitas User/Playlist.
   * @param {string} playlistId - ID playlist.
   * @param {string} userId - ID user yang akan ditambahkan sebagai kolaborator.
   * @returns {Promise<string>} ID kolaborasi yang baru dibuat.
   * @throws {InvariantError} Jika kolaborasi sudah ada.
   * @throws {NotFoundError} Jika Playlist atau User tidak ditemukan (opsional, dapat digantikan dengan Foreign Key Constraint Error di DB).
   */

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      // Menggunakan InvariantError di sini sesuai dengan logic lama 
      // atau NotFoundError jika Anda ingin eksplisit bahwa kolaborasi tidak ada.
      // Karena PlaylistsService menggunakan Invariant/NotFoundError untuk memetakan ke AuthorizationError, 
      // InvariantError di sini lebih aman (atau buat error custom jika perlu, tapi kita pakai yang sudah ada)
      throw new InvariantError('Gagal memverifikasi kolaborator. User bukan kolaborator.');
    }
  }
  
  async addCollaboration(playlistId, userId) {
    await this.verifyCollaboratorExistence(playlistId, userId); // Check duplikasi

    // Asumsi: Playlist existence check dilakukan di layer Service di atasnya (PlaylistsService),
    // atau dijamin oleh Foreign Key constraint. Namun, untuk error message yang lebih baik, 
    // kita bisa menambahkan pengecekan eksistensi parent entities (Playlist dan User)
    
    // --- Pengecekan Eksistensi Playlist ---
    const playlistCheckQuery = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const playlistCheckResult = await this._pool.query(playlistCheckQuery);

    if (!playlistCheckResult.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    // --- Pengecekan Eksistensi User ---
    const userCheckQuery = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };
    const userCheckResult = await this._pool.query(userCheckQuery);
    
    if (!userCheckResult.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }

    // --- Insert Kolaborasi ---
    const id = `collab-${nanoid(16)}`; 
    
    const query = {
      text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);
    
    return result.rows[0].id;
  }

  /**
   * Menghapus kolaborasi dari database.
   * @param {string} playlistId - ID playlist.
   * @param {string} userId - ID user yang akan dihapus dari kolaborator.
   * @returns {Promise<void>}
   * @throws {NotFoundError} Jika kolaborasi tidak ditemukan.
   */
  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Kolaborasi tidak ditemukan');
    }
  }

  /**
   * Helper untuk memverifikasi apakah user sudah menjadi kolaborator.
   * @param {string} playlistId - ID playlist.
   * @param {string} userId - ID user.
   * @throws {InvariantError} Jika kolaborasi sudah ada.
   */
  async verifyCollaboratorExistence(playlistId, userId) {
    const query = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Kolaborasi sudah ditambahkan');
    }
  }
}

export default CollaborationsService;