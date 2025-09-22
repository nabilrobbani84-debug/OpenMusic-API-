import { nanoid } from 'nanoid';
import pg from 'pg'; // atau 'import { Pool } from 'pg';' jika Anda lebih suka
import InvariantError from '../exceptions/InvariantError.js';
import NotFoundError from '../exceptions/NotFoundError.js';

class SongsService {
  constructor() {
    this._pool = new pg.Pool(); // Menggunakan pg.Pool() jika mengimpor pg secara default
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    return result.rows[0].id;
  }
  
  async getSongs({ title, performer }) {
    let queryText = 'SELECT id, title, performer FROM songs';
    const queryValues = [];
    const conditions = [];
    
    if (title) {
        conditions.push(`title ILIKE '%' || $${conditions.length + 1} || '%'`);
        queryValues.push(title);
    }
    if (performer) {
        conditions.push(`performer ILIKE '%' || $${conditions.length + 1} || '%'`);
        queryValues.push(performer);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await this._pool.query({
      text: queryText,
      values: queryValues
    });
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    return result.rows[0];
  }
  
  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

export default SongsService;