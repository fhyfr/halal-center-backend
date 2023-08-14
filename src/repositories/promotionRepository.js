const { nanoid } = require('nanoid');
const Models = require('./models');
const logger = require('../helpers/logger');

class PromotionRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.promotionModel = Models.Promotion;
  }

  async findByPromotionId(promotionId) {
    const cacheKey = this.constructor.cacheKeyByPromotionId(promotionId);

    try {
      const promotion = await this.cacheService.get(cacheKey);

      return JSON.parse(promotion);
    } catch (error) {
      const promotion = await this.promotionModel.findOne({
        where: { promotionId },
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
      attributes: ['promotionId'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: promotionIds.count,
      rows: promotionIds.rows.map(
        (promotionIds.rows, (promotion) => promotion.promotionId),
      ),
    };
  }

  async create(promotion) {
    Object.assign(promotion, {
      promotionId: `promotion-${nanoid(16)}`,
    });

    const result = await this.promotionModel.create(promotion);
    if (result === null) {
      logger.error('create promotion failed');
      throw new Error('create promotion failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByPromotionId(
      result.promotionId,
    );

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async deleteByPromotionId(promotionId, userId) {
    const result = await this.promotionModel.destroy({
      where: { promotionId },
    });

    await this.promotionModel.update(
      { deletedBy: userId },
      {
        where: { promotionId },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyByPromotionId(promotionId);
    await this.cacheService.delete(cacheKey);

    return result;
  }

  static cacheKeyByPromotionId(promotionId) {
    return `promotion:${promotionId}`;
  }
}

module.exports = PromotionRepository;
