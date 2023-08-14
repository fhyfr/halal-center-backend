const { nanoid } = require('nanoid');
const Models = require('./models');
const logger = require('../helpers/logger');

class PositionRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.positionModel = Models.Position;
  }

  async findByPositionId(positionId) {
    const cacheKey = this.constructor.cacheKeyByPositionId(positionId);

    try {
      const position = await this.cacheService.get(cacheKey);

      return JSON.parse(position);
    } catch (error) {
      const position = await this.positionModel.findOne({
        where: { positionId },
        raw: true,
      });

      if (position === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(position));

      return position;
    }
  }

  async findByPositionName(positionName) {
    const position = await this.positionModel.findOne({
      where: {
        positionName: {
          [Models.Sequelize.Op.iLike]: positionName,
        },
      },
      attributes: ['positionId'],
      raw: true,
    });

    if (position === null) return null;
    return position;
  }

  async findAll(offset, limit, query) {
    if (query && query !== '') {
      const positionIds = await this.positionModel.findAndCountAll({
        order: [['createdAt', 'DESC']],
        attributes: ['positionId'],
        where: {
          positionName: {
            [Models.Sequelize.Op.iLike]: `%${query}%`,
          },
        },
        limit,
        offset,
        raw: true,
      });

      return {
        count: positionIds.count,
        rows: positionIds.rows.map(
          (positionIds.rows, (position) => position.positionId),
        ),
      };
    }

    const positionIds = await this.positionModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['positionId'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: positionIds.count,
      rows: positionIds.rows.map(
        (positionIds.rows, (position) => position.positionId),
      ),
    };
  }

  async create(position) {
    Object.assign(position, {
      positionId: `position-${nanoid(16)}`,
    });

    const result = await this.positionModel.create(position);
    if (result === null) {
      logger.error('create position failed');
      throw new Error('create position failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByPositionId(result.positionId);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));

    return result.dataValues;
  }

  async update(position) {
    const result = await this.positionModel.update(position, {
      where: { positionId: position.positionId },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('update position failed');
    }

    const cacheKey = this.constructor.cacheKeyByPositionId(
      result[1][0].positionId,
    );

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteByPositionId(positionId, userId) {
    const result = await this.positionModel.destroy({ where: { positionId } });

    await this.positionModel.update(
      { deletedBy: userId },
      {
        where: { positionId },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyByPositionId(positionId);
    await this.cacheService.delete(cacheKey);

    return result;
  }

  static cacheKeyByPositionId(positionId) {
    return `position:${positionId}`;
  }
}

module.exports = PositionRepository;
