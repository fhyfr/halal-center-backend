const Models = require('./models');
const logger = require('../helpers/logger');

class RegistrationPaymentRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.registrationPaymentModel = Models.RegistrationPayment;
  }

  async findByRegistrationPaymentId(id) {
    const cacheKey = this.constructor.cacheKeyByRegistrationPaymentId(id);

    try {
      const registrationPayment = await this.cacheService.get(cacheKey);

      return JSON.parse(registrationPayment);
    } catch (error) {
      const registrationPayment = await this.registrationPaymentModel.findOne({
        where: { id },
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
        attributes: ['id'],
        where: whereConditions,
        limit,
        offset,
        raw: true,
      });

    return {
      count: registrationPaymentIds.count,
      rows: registrationPaymentIds.rows.map(
        (registrationPaymentIds.rows,
        (registrationPayment) => registrationPayment.id),
      ),
    };
  }

  async create(registrationPayment) {
    const result = await this.registrationPaymentModel.create(
      registrationPayment,
    );
    if (result === null) {
      logger.error('create registration payment failed');
      throw new Error('create registration payment failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByRegistrationPaymentId(
      result.id,
    );

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async update(registrationPayment) {
    const result = await this.registrationPaymentModel.update(
      registrationPayment,
      {
        where: {
          id: registrationPayment.id,
        },
        returning: true,
        raw: true,
      },
    );

    if (result[0] === 0) {
      throw new Error('update registration payment failed');
    }

    const cacheKey = this.constructor.cacheKeyByRegistrationPaymentId(
      result[1][0].id,
    );

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteByRegistrationPaymentId(id, userId) {
    const result = await this.registrationPaymentModel.destroy({
      where: { id },
    });

    await this.registrationPaymentModel.update(
      { deletedBy: userId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyByRegistrationPaymentId(id);

    await this.cacheService.delete(cacheKey);
    return result;
  }

  static cacheKeyByRegistrationPaymentId(id) {
    return `registration-payment:${id}`;
  }
}

module.exports = RegistrationPaymentRepository;
