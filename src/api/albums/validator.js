const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema } = require('.'); // Asumsi skema berada di file terpisah

const AlbumValidator = {
  validateAlbumPayload(payload) {
    const { name, year } = payload;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new InvariantError('Nama album harus diisi');
    }
    if (!year || typeof year !== 'number') {
      throw new InvariantError('Tahun album harus berupa angka');
    }
  }
};

module.exports = AlbumValidator;