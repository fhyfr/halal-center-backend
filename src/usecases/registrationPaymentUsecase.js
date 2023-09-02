const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  registrationPayment: registrationPaymentMessage,
  registration: registrationMessage,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class RegistrationPaymentUsecase {
  constructor(registrationPaymentRepo, registrationRepo) {
    this.registrationPaymentRepo = registrationPaymentRepo;
    this.registrationRepo = registrationRepo;
  }

  async findByRegistrationPaymentId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'RegistrationPayment');

    const registrationPayment =
      await this.registrationPaymentRepo.findByRegistrationPaymentId(id);
    if (registrationPayment === null) {
      throw new NotFoundError(registrationPaymentMessage.notFound);
    }

    return this.resolveRegistrationPaymentData(registrationPayment);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan(
      'read',
      'RegistrationPayment',
    );

    const { page, size, registrationId, courseId, userId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.registrationPaymentRepo.findAll(
      offset,
      limit,
      registrationId,
      courseId,
      userId,
    );

    const dataRows = {
      count: ids.count,
      rows: await this.resolveRegistrationPayments(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan(
      'create',
      'RegistrationPayment',
    );

    Object.assign(req.body, {
      createdBy: req.user.userId,
    });

    const isRegistrationExist =
      await this.registrationRepo.findByRegistrationId(req.body.registrationId);
    if (!isRegistrationExist || isRegistrationExist === null) {
      throw new InvariantError(
        `${registrationMessage.notFound} for registrationId: ${req.body.registrationId}`,
      );
    }

    const result = await this.registrationPaymentRepo.create(req.body);

    return this.resolveRegistrationPaymentData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan(
      'update',
      'RegistrationPayment',
    );

    const existingRegistrationPayment =
      await this.registrationPaymentRepo.findByRegistrationPaymentId(
        req.params.id,
      );
    if (!existingRegistrationPayment) {
      throw new NotFoundError(registrationPaymentMessage.notFound);
    }

    if (req.body.registrationId) {
      const isRegistrationExist =
        await this.registrationRepo.findByRegistrationId(
          req.body.registrationId,
        );
      if (!isRegistrationExist || isRegistrationExist === null) {
        throw new InvariantError(
          `${registrationMessage.notFound} for registrationId: ${req.body.registrationId}`,
        );
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.userId,
    });

    const result = await this.registrationPaymentRepo.update(req.body);

    return this.resolveRegistrationPaymentData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan(
      'delete',
      'RegistrationPayment',
    );

    const registrationPayment =
      await this.registrationPaymentRepo.findByRegistrationPaymentId(id);
    if (registrationPayment === null) {
      throw new NotFoundError(registrationPaymentMessage.notFound);
    }

    return this.registrationPaymentRepo.deleteByRegistrationPaymentId(
      id,
      userId,
    );
  }

  async resolveRegistrationPayments(ids) {
    const registrationPayments = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const registrationPayment =
        await this.registrationPaymentRepo.findByRegistrationPaymentId(nextID);

      if (registrationPayment == null) {
        logger.error(`${registrationPaymentMessage.null} ${nextID}`);
      } else {
        registrationPayments.push(
          await this.resolveRegistrationPaymentData(registrationPayment),
        );
      }
    }, Promise.resolve());

    return registrationPayments;
  }

  async resolveRegistrationPaymentData(registrationPayment) {
    const { deletedAt, deletedBy, ...registrationPaymentData } =
      registrationPayment;

    const registration = await this.registrationRepo.findByRegistrationId(
      registrationPaymentData.registrationId,
    );
    if (registration && registration !== null) {
      delete registration.deletedBy;

      Object.assign(registrationPaymentData, { registration });
    }

    return registrationPaymentData;
  }
}

module.exports = RegistrationPaymentUsecase;
