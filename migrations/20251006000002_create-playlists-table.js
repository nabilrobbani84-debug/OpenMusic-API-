// nabilrobbani84-debug/openmusic-api-/OpenMusic-API--ab944dbaeb9d0fd8c572bca07d36672053ff1850/migrations/20251006000002_create-playlists-table.js 
/* eslint-disable camelcase */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      references: 'users',
      onDelete: 'CASCADE', // Kriteria 3: playlists references users
      notNull: true,
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('playlists');
};