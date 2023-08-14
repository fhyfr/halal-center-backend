const { nanoid } = require('nanoid');
const Models = require('./models');
const logger = require('../helpers/logger');

class RegistrationPaymentRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.registrationPaymentModel = Models.RegistrationPayment;
  }

  async findByRegistrationPaymentId(registrationPaymentId) {
    const cacheKey = this.constructor.cacheKeyByRegistrationPaymentId(
      registrationPaymentId,
    );

    try {
      const registrationPayment = await this.cacheService.get(cacheKey);

      return JSON.parse(registrationPayment);
    } catch (error) {
      const registrationPayment = await this.registrationPaymentModel.findOne({
        where: { registrationPaymentId },
        raw: true,
      });

      if (registrationPayment === null) return null;

      await this.cacheService.set(
        cacheKey,
        JSON.stringify(registrationPayment),
      );
      return registrationPayment;
    }
  }

  async findAll(offset, limit, registrationId) {
    const whereConditions = {};

    if (registrationId) {
      Object.assign(whereConditions, {
        registrationId,
      });
    }

    const registrationPaymentIds =
      await this.registrationPaymentModel.findAndCountAll({
        order: [['createdAt', 'DESC']],
        attributes: ['registrationPaymentId'],
        where: whereConditions,
        limit,
        offset,
        raw: true,
      });

    return {
      count: registrationPaymentIds.count,
      rows: registrationPaymentIds.rows.map(
        (registrationPaymentIds.rows,
        (registrationPayment) => registrationPayment.registrationPaymentId),
      ),
    };
  }

  async create(registrationPayment) {
    Object.assign(registrationPayment, {
      registrationPaymentId: `registration-payment-${nanoid(16)}`,
    });

    const result = await this.registrationPaymentModel.create(
      registrationPayment,
    );
    if (result === null) {
      logger.error('create registration payment failed');
      throw new Error('create registration payment failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByRegistrationPaymentId(
      result.registrationPaymentId,
    );

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async update(registrationPayment) {
    const result = await this.registrationPaymentModel.update(
      registrationPayment,
      {
        where: {
          registrationPaymentId: registrationPayment.registrationPaymentId,
        },
        returning: true,
        raw: true,
      },
    );

    if (result[0] === 0) {
      throw new Error('update registration payment failed');
    }

    const cacheKey = this.constructor.cacheKeyByRegistrationPaymentId(
      result[1][0].registrationPaymentId,
    );

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteByRegistrationPaymentId(registrationPaymentId, userId) {
    const result = await this.registrationPaymentModel.destroy({
      where: { registrationPaymentId },
    });

    await this.registrationPaymentModel.update(
      { deletedBy: userId },
      {
        where: { registrationPaymentId },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyByRegistrationPaymentId(
      registrationPaymentId,
    );

    await this.cacheService.delete(cacheKey);
    return result;
  }

  static cacheKeyByRegistrationPaymentId(registrationPaymentId) {
    return `registration-payment:${registrationPaymentId}`;
  }
}

module.exports = RegistrationPaymentRepository;
