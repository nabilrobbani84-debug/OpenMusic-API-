// src/services/PlaylistsService.js
import { Pool } from 'pg';
import { nanoid } from 'nanoid'; 
import InvariantError from '../exceptions/InvariantError.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import AuthorizationError from '../exceptions/AuthorizationError.js';

class PlaylistsService {
  constructor(collaborationService, activitiesService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._activitiesService = activitiesService;
    console.log('PlaylistsService dimuat');
  }

  /**
   * Menambahkan playlist baru ke database.
   * @param {object} payload - Objek yang berisi name (nama playlist) dan owner (ID pemilik).
   * @returns {Promise<string>} ID playlist yang baru dibuat.
   */
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`; 
    
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Mendapatkan semua playlist milik user, termasuk yang berkolaborasi.
   * @param {string} userId - ID pengguna.
   * @returns {Promise<Array<object>>} Array objek playlist.
   */
  async getPlaylists(userId) {
    const query = {
      text: `
        SELECT p.id, p.name, u.username
        FROM playlists p
        LEFT JOIN collaborations c ON p.id = c.playlist_id
        JOIN users u ON p.owner = u.id
        WHERE p.owner = $1 OR c.user_id = $1
        GROUP BY p.id, p.name, u.username
        ORDER BY p.id
      `,
      values: [userId],
    };
    
    const result = await this._pool.query(query);
    return result.rows;
  }

  /**
   * Menghapus playlist berdasarkan ID.
   * @param {string} id - ID playlist.
   * @returns {Promise<void>}
   * @throws {NotFoundError} Jika playlist tidak ditemukan.
   */
  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. ID tidak ditemukan');
    }
  }

  /**
   * Menambahkan lagu ke dalam playlist.
   * Mencatat aktivitas ke ActivitiesService.
   * @param {string} playlistId - ID playlist.
   * @param {string} songId - ID lagu.
   * @param {string} userId - ID pengguna yang menambahkan.
   * @returns {Promise<void>}
   */
  async addSongToPlaylist(playlistId, songId, userId) {
    const id = `ps-${nanoid(16)}`;

    // Pengecekan duplikasi lagu di playlist
    const checkQuery = {
        text: 'SELECT id FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
        values: [playlistId, songId],
    };
    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rowCount > 0) {
        throw new InvariantError('Lagu sudah ada di dalam playlist');
    }

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    // Mencatat aktivitas penambahan lagu
    await this._activitiesService.addActivity(playlistId, songId, userId, 'add');
  }

  /**
   * Mendapatkan lagu-lagu dalam playlist berdasarkan ID playlist.
   * @param {string} playlistId - ID playlist.
   * @returns {Promise<object>} Objek yang berisi detail playlist dan daftar lagu.
   */
  async getPlaylistSongs(playlistId) {
    // Mendapatkan detail playlist dan owner
    const playlistQuery = {
        text: `
            SELECT p.id, p.name, u.username
            FROM playlists p
            JOIN users u ON p.owner = u.id
            WHERE p.id = $1
        `,
        values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);

    if (!playlistResult.rowCount) {
        throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = playlistResult.rows[0];

    // Mendapatkan daftar lagu dalam playlist
    const songsQuery = {
        text: `
            SELECT s.id, s.title, s.performer
            FROM songs s
            JOIN playlist_songs ps ON s.id = ps.song_id
            WHERE ps.playlist_id = $1
        `,
        values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);
    
    // Menggabungkan data playlist dan songs
    return {
        id: playlist.id,
        name: playlist.name,
        username: playlist.username,
        songs: songsResult.rows.map(song => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
        })),
    };
  }

  /**
   * Menghapus lagu dari playlist.
   * Mencatat aktivitas ke ActivitiesService.
   * @param {string} playlistId - ID playlist.
   * @param {string} songId - ID lagu.
   * @param {string} userId - ID pengguna yang menghapus.
   * @returns {Promise<void>}
   * @throws {NotFoundError} Jika lagu tidak ditemukan dalam playlist.
   */
  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. ID lagu tidak ditemukan di playlist');
    }

    // Mencatat aktivitas penghapusan lagu
    await this._activitiesService.addActivity(playlistId, songId, userId, 'delete');
  }

  /**
   * Memverifikasi apakah pengguna adalah pemilik playlist (owner).
   * @param {string} playlistId - ID playlist.
   * @param {string} userId - ID pengguna yang diklaim sebagai owner.
   * @returns {Promise<void>}
   * @throws {AuthorizationError} Jika user bukan owner.
   * @throws {NotFoundError} Jika playlist tidak ditemukan.
   */
  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  /**
   * Memverifikasi apakah pengguna adalah pemilik atau kolaborator playlist.
   * Digunakan untuk otorisasi akses ke playlist dan songs di dalamnya.
   * @param {string} playlistId - ID playlist.
   * @param {string} userId - ID pengguna yang mengakses.
   * @returns {Promise<void>}
   * @throws {AuthorizationError} Jika user bukan owner atau kolaborator.
   * @throws {NotFoundError} Jika playlist tidak ditemukan.
   */
  async verifyPlaylistAccess(playlistId, userId) {
    const query = {
        text: 'SELECT owner FROM playlists WHERE id = $1',
        values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
        throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    // Jika user adalah owner, akses diizinkan
    if (playlist.owner === userId) {
        return;
    }

    // Jika bukan owner, cek sebagai kolaborator
    try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
    } catch (error) {
        // Jika CollaborationsService melempar NotFoundError atau InvariantError (yang artinya bukan kolaborator)
        // Maka kita lempar AuthorizationError
        if (error instanceof NotFoundError || error instanceof InvariantError) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
        // Jika ada error lain (misal error server dari CollaborationsService), lempar error tersebut
        throw error;
    }
  }
}

export default PlaylistsService;