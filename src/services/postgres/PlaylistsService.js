const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addNewPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist failed to be created');
    }

    return result.rows[0].id;
  }

  async getPlaylistByOwner(owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE owner=$1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    const username = await this.getUsernameById(owner);

    const mappedData = result.rows.map((element) => {
      const item = { id: element.id, name: element.name, username: username.username };
      return item;
    });

    return mappedData;
  }

  async getPlaylistCollab(userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      JOIN collaborations ON collaborations.playlist_id = playlists.id
      JOIN users ON users.id = playlists.owner
      WHERE collaborations.user_id = $1 
      GROUP BY playlists.id ,users.username`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to delete playlist, Id not found');
    }
  }

  async addSongToPlaylist(idPlaylist, idSong) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, idPlaylist, idSong],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song failed to be added to playlist');
    }
  }

  async deleteSongFromPlaylist(idPlaylist, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [idPlaylist, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new NotFoundError('Fail to delete song from playlist, Id not found');
    }
  }

  async getPlaylistById(idPlaylist) {
    const query = {
      text: `SELECT * FROM playlists WHERE id = $1`,
      values: [idPlaylist],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('playlist not found, Id not found');
    }

    return result.rows[0];
  }

  async getSongInPlaylist(idPlaylist) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
      LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1 
      GROUP BY songs.id`,
      values: [idPlaylist],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongTitle(idSong) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [idSong],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }

    return result.rows[0].title;
  }

  async verifySong(idSong) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [idSong],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('You dont have authorization for this action');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        try {
          await this._collaborationService.verifyCollaborator(playlistId, userId);
        } catch (error) {
          throw new AuthorizationError('You dont have authorization for this action');
        }
      }
    }
  }

  async getUsernameById(userId) {
    const query = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [userId],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async recordActivities(playlistId, username, songTitle, action, time) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, username, songTitle, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Action Log failed to be created');
    }
  }

  async getActivitiesInPlaylist(playlistId) {
    const query = {
      text: 'SELECT * FROM playlist_song_activities WHERE playlist_id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('No activities fo this playlist');
    }

    return result.rows;
  }
}

module.exports = PlaylistsService;
