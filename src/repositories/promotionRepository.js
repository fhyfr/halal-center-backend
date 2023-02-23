const Models = require('./models');
const logger = require('../helpers/logger');

class PromotionRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.promotionModel = Models.Promotion;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const promotion = await this.cacheService.get(cacheKey);

      return JSON.parse(promotion);
    } catch (error) {
      const promotion = await this.promotionModel.findOne({
        where: { id },
        raw: true,
      });

      if (promotion === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(promotion));

      return promotion;
    }
  }

  async findAll(offset, limit) {
    const promotionIds = await this.promotionModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: promotionIds.count,
      rows: promotionIds.rows.map(
        (promotionIds.rows, (promotion) => promotion.id),
      ),
    };
  }

  async create(promotion) {
    const result = await this.promotionModel.create(promotion);

    if (result === null) {
      logger.error('create promotion failed');
      throw new Error('create promotion failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async deleteById(id, userId) {
    const result = await this.promotionModel.destroy({ where: { id } });

    await this.promotionModel.update(
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
    return `promotion:${id}`;
  }
}

module.exports = PromotionRepository;
