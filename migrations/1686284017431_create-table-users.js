/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(21)',
      primaryKey: true,
    },
    username: {
      type: 'TEXT',
      notNull: true,
    },
    password: {
      type: 'TEXT',
      notNull: true,
    },
    fullname: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
