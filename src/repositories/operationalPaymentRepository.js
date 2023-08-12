const Models = require('./models');
const logger = require('../helpers/logger');

class OperationalPaymentRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.operationalPaymentModel = Models.OperationalPayment;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const operationalPayment = await this.cacheService.get(cacheKey);

      return JSON.parse(operationalPayment);
    } catch (error) {
      const operationalPayment = await this.operationalPaymentModel.findOne({
        where: { id },
        raw: true,
      });

      if (operationalPayment === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(operationalPayment));
      return operationalPayment;
    }
  }

  async findAll(offset, limit, courseId) {
    const whereConditions = {};

    if (courseId) {
      Object.assign(whereConditions, {
        courseId,
      });
    }

    const operationalPaymentIds =
      await this.operationalPaymentModel.findAndCountAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id'],
        where: whereConditions,
        limit,
        offset,
        raw: true,
      });

    return {
      count: operationalPaymentIds.count,
      rows: operationalPaymentIds.rows.map(
        (operationalPaymentIds.rows,
        (operationalPayment) => operationalPayment.id),
      ),
    };
  }

  async create(operationalPayment) {
    const result = await this.operationalPaymentModel.create(
      operationalPayment,
    );

    if (result === null) {
      logger.error('create operational payment failed');
      throw new Error('create operational payment failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async update(operationalPayment) {
    const result = await this.operationalPaymentModel.update(
      operationalPayment,
      {
        where: { id: operationalPayment.id },
        returning: true,
        raw: true,
      },
    );

    if (result[0] === 0) {
      throw new Error('update operational payment failed');
    }

    const cacheKey = this.constructor.cacheKeyById(result[1][0].id);

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteById(id, userId) {
    const result = await this.operationalPaymentModel.destroy({
      where: { id },
    });

    await this.operationalPaymentModel.update(
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
    return `operational-payment:${id}`;
  }
}

module.exports = OperationalPaymentRepository;
