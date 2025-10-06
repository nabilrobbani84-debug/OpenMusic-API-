// nabilrobbani84-debug/openmusic-api-/OpenMusic-API--ab944dbaeb9d0fd8c572bca07d36672053ff1850/migrations/20251006000001_create-authentications-table.js (New File)
/* eslint-disable camelcase */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('authentications');
};