/* eslint-disable quotes */
exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(22)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'NUMERIC',
      notNull: true,
    },
    coverUrl: {
      type: 'TEXT',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
