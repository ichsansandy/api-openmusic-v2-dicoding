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
      throw new InvariantError('Song failed to be created');
    }

    return result.rows[0].id;
  }

  async getPlaylistByOwner(owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE owner=$1',
      values: [owner],
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

  async deleteSongFromPlaylist(idPlaylist) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [idPlaylist, idSong],
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
    return result.rows[0];
  }

  async getSongInPlaylist(idPlaylist) {
    const query = {
      text: `SELECT id, title, performer FROM songs
      LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1 
      GROUP BY songs.id`,
      values: [idPlaylist],
    };
    const result = await this._pool.query(query);
    return result.rows;
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
    await this.verifyplaylistOwner(playlistId, userId);
    await this._collaborationService.verifyCollaborator(playlistId, userId);
  }

  async getUsersByUsername(username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistsService;
