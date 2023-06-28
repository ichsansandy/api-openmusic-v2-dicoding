exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: {
      type: 'VARCHAR(16)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(25)',
      notNull: true,
    },
    username: {
      type: 'TEXT',
      notNull: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    action: {
      type: 'TEXT',
      notNull: true,
    },
    time: {
      type: 'TEXT',
      notNull: true,
    },
  });

  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id');


  pgm.dropTable('playlist_song_activities');
};
