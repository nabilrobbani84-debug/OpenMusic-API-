/* eslint-disable camelcase */
// migrations/20251006000004_create-collaborations-table.js

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      references: 'playlists',
      onDelete: 'CASCADE', // Jika playlist dihapus, kolaborasi juga dihapus
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      references: 'users',
      onDelete: 'CASCADE', // Jika user dihapus, kolaborasi juga dihapus
      notNull: true,
    },
  });
  
  // Menambahkan unique constraint agar satu user hanya bisa berkolaborasi sekali di satu playlist
  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', {
    unique: ['playlist_id', 'user_id'],
  });
};

export const down = (pgm) => {
  pgm.dropTable('collaborations');
};