/* eslint-disable camelcase */
// migrations/20251006000005_create-playlist-song-activities-table.js

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      references: 'playlists',
      onDelete: 'CASCADE',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      references: 'songs',
      onDelete: 'SET NULL', // Biarkan log tetap ada, song_id bisa null jika lagu dihapus
    },
    user_id: {
      type: 'VARCHAR(50)',
      references: 'users',
      onDelete: 'CASCADE', // Jika user dihapus, log aktivitas juga dihapus
      notNull: true,
    },
    action: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    time: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('playlist_song_activities');
};