const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addNewAlbum(name, year) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
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

  async editCoverAlbum(coverUrl, albumId) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, albumId],
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

  async addLikeToAlbum(albumId, userId) {
    await this.verifyDuplicateLike(albumId, userId);
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Like failed to be added');
    }

    await this._cacheService.delete(`albumLike:${albumId}`);
  }

  async verifyDuplicateLike(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Like duplicated');
    }
  }

  async unLikeAlbum(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Fail to unlike album');
    }

    await this._cacheService.delete(`albumLike:${albumId}`);
  }

  async getAlbumLike(albumId) {
    try {
      const result = await this._cacheService.get(`albumLike:${albumId}`);

      return { ...JSON.parse(result), cache: true };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('album likes didnt found');
      }

      const number = { data: { likes: Number(result.rows[0].count) }, cache: false };

      await this._cacheService.set(`albumLike:${albumId}`, JSON.stringify(number));

      return number;
    }
  }
}

module.exports = AlbumsService;
