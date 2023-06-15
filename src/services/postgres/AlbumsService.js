const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addNewAlbum(name, year) {
    const newAlbum = {
      id: `album-${nanoid(16)}`,
      name: name,
      year: year,
    };

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [newAlbum.id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album failed to be created');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT * 
             FROM albums 
             WHERE id = $1
             `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Album not found');
    }

    const mappedData = {
      ...result.rows[0],
      year: Number(result.rows[0].year),
    };

    return mappedData;
  }

  async getSongByAlbumId(albumId) {
    const query = {
      text: `SELECT id, title, performer
             FROM songs
             WHERE "albumId" = $1`,
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async editAlbum(id, name, year) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to update album, Id not found');
    }
  }

  async deleteAlbum(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to delete album, Id not found');
    }
  }
}

module.exports = AlbumsService;
