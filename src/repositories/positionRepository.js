const Models = require('./models');
const logger = require('../helpers/logger');

class PositionRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.positionModel = Models.Position;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const position = await this.cacheService.get(cacheKey);

      return JSON.parse(position);
    } catch (error) {
      const position = await this.positionModel.findOne({
        where: { id },
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
      attributes: ['id'],
      raw: true,
    });

    if (position === null) return null;
    return position;
  }

  async findAll(offset, limit, query) {
    if (query && query !== '') {
      const positionIds = await this.positionModel.findAndCountAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id'],
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
          (positionIds.rows, (position) => position.id),
        ),
      };
    }

    const positionIds = await this.positionModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: positionIds.count,
      rows: positionIds.rows.map((positionIds.rows, (position) => position.id)),
    };
  }

  async create(position) {
    const result = await this.positionModel.create(position);

    if (result == null) {
      logger.error('create position failed');
      throw new Error('create position failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));

    return result.dataValues;
  }

  async update(position) {
    const result = await this.positionModel.update(position, {
      where: { id: position.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('failed update position');
    }

    const cacheKey = this.constructor.cacheKeyById(result[1][0].id);

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteById(id, userId) {
    const result = await this.positionModel.destroy({ where: { id } });

    await this.positionModel.update(
      { deletedBy: userId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyById(id);
    await this.cacheService.delete(cacheKey);

    return result;
  }

  static cacheKeyById(id) {
    return `position:${id}`;
  }
}

module.exports = PositionRepository;
