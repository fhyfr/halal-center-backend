const Models = require('./models');
const logger = require('../helpers/logger');

class PaymentRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.paymentModel = Models.Payment;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const payment = await this.cacheService.get(cacheKey);

      return JSON.parse(payment);
    } catch (error) {
      const payment = await this.paymentModel.findOne({
        where: { id },
        raw: true,
      });

      if (payment === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(payment));
      return payment;
    }
  }

  async findAll(offset, limit, courseId, userId, type) {
    const whereConditions = {};

    if (courseId) {
      Object.assign(whereConditions, {
        courseId,
      });
    }

    if (userId) {
      Object.assign(whereConditions, {
        userId,
      });
    }

    if (type && type !== '') {
      Object.assign(whereConditions, {
        type: type.toUpperCase(),
      });
    }

    const paymentIds = await this.paymentModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    return {
      count: paymentIds.count,
      rows: paymentIds.rows.map((paymentIds.rows, (payment) => payment.id)),
    };
  }

  async create(payment) {
    const result = await this.paymentModel.create(payment);

    if (result === null) {
      logger.error('create payment failed');
      throw new Error('create payment failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async update(payment) {
    const result = await this.paymentModel.update(payment, {
      where: { id: payment.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('update payment failed');
    }

    const cacheKey = this.constructor.cacheKeyById(result[1][0].id);

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteById(id, userId) {
    const result = await this.paymentModel.destroy({ where: { id } });

    await this.paymentModel.update(
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
    return `payment:${id}`;
  }
}

module.exports = PaymentRepository;
