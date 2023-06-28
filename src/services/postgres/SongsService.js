const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addNewSong(title, year, genre, performer, duration, albumId) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song failed to be created');
    }

    return result.rows[0].id;
  }

  async getSongByTitle(title) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1',
      values: [`${title}%`],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getSongByPerformer(performer) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE performer ILIKE $1',
      values: [`${performer}%`],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getSongByTitleAndPerformer(title, performer) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE performer ILIKE $1 AND title ILIKE $2',
      values: [`${performer}%`, `${title}%`],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getAllSong() {
    const result = await this._pool.query('SELECT id, title, performer FROM songs');

    return result.rows;
  }

  async getAllSongWithParams(title, performer) {
    let songs;

    if (title && !performer) {
      songs = await this.getSongByTitle(title);
    } else if (!title && performer) {
      songs = await this.getSongByPerformer(performer);
    } else if (title && performer) {
      songs = await this.getSongByTitleAndPerformer(title, performer);
    } else {
      songs = await this.getAllSong();
    }

    return songs;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Album not found');
    }

    const mappedData = {
      ...result.rows[0],
      year: Number(result.rows[0].year),
      duration: Number(result.rows[0].duration),
    };

    return mappedData;
  }

  async editSong(id, title, year, genre, performer, duration, albumId) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to update album, Id not found');
    }
  }

  async deleteSong(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to delete album, Id not found');
    }
  }
}

module.exports = SongsService;
