// nabilrobbani84-debug/openmusic-api-/OpenMusic-API--ab944dbaeb9d0fd8c572bca07d36672053ff1850/migrations/1758125711432_create-songs-table.js (Modified)
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    performer: {
      type: 'TEXT',
      notNull: true,
    },
    genre: {
      type: 'TEXT',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
    },
    album_id: {
      type: 'VARCHAR(50)',
      references: 'albums',
      onDelete: 'CASCADE', // PERUBAHAN: Tambah onDelete CASCADE
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('songs');
};