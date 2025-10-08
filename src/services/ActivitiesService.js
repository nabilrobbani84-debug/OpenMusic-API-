// src/services/ActivitiesService.js
import { Pool } from 'pg';
import { nanoid } from 'nanoid'; // Menambahkan import nanoid
import InvariantError from '../exceptions/InvariantError.js';

class ActivitiesService {
  constructor() {
    // 1. Inisialisasi koneksi database menggunakan Pool
    this._pool = new Pool();
    console.log('ActivitiesService dimuat dan terkoneksi ke database');
  }

  /**
   * Menambahkan aktivitas ke database saat lagu ditambahkan atau dihapus dari playlist.
   * @param {string} playlistId - ID playlist.
   * @param {string} songId - ID lagu.
   * @param {string} userId - ID pengguna yang melakukan aksi.
   * @param {'add' | 'delete'} action - Aksi yang dilakukan ('add' atau 'delete').
   * @returns {Promise<void>}
   */
  async addActivity(playlistId, songId, userId, action) {
    // PERBAIKAN: Mengganti Date.now() dengan nanoid untuk ID yang lebih unik
    const id = `activity-${nanoid(16)}`; 
    const time = new Date().toISOString(); // Biarkan format time dalam ISO

    const query = {
      text: 'INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action, time) VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    await this._pool.query(query);
  }

  /**
   * Mengambil semua aktivitas untuk sebuah playlist, termasuk username pengguna.
   * @param {string} playlistId - ID playlist.
   * @returns {Promise<Array<object>>} - Array objek aktivitas.
   */
  async getActivities(playlistId) {
    const query = {
      text: `
        SELECT 
          u.username,
          s.title,
          ps.action,
          ps.time
        FROM 
          playlist_song_activities ps
        JOIN 
          users u ON ps.user_id = u.id
        LEFT JOIN
          songs s ON ps.song_id = s.id
        WHERE 
          ps.playlist_id = $1
        ORDER BY 
          ps.time ASC
      `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    
    // Format hasil sesuai spesifikasi (jika perlu)
    const activities = result.rows.map((row) => ({
        username: row.username,
        title: row.title,
        action: row.action,
        time: row.time,
    }));

    return activities;
  }
}

export default ActivitiesService;