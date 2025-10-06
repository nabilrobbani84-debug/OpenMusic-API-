// nabilrobbani84-debug/openmusic-api-/OpenMusic-API--ab944dbaeb9d0fd8c572bca07d36672053ff1850/migrations/20251006000003_create-playlist-songs-table.js (New File)
/* eslint-disable camelcase */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      references: 'playlists',
      onDelete: 'CASCADE', // Kriteria 3
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      references: 'songs',
      onDelete: 'CASCADE', // Kriteria 3
      notNull: true,
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('playlist_songs');
};