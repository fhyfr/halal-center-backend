const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  operationalPayment: operationalPaymentMessage,
  course: courseMessage,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class OperationalPaymentUsecase {
  constructor(operationalPaymentRepo, courseRepo) {
    this.operationalPaymentRepo = operationalPaymentRepo;
    this.courseRepo = courseRepo;
  }

  async findByOperationalPaymentId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'OperationalPayment');

    const operationalPayment =
      await this.operationalPaymentRepo.findByOperationalPaymentId(id);
    if (operationalPayment === null) {
      throw new NotFoundError(operationalPaymentMessage.notFound);
    }

    return this.resolveOperationalPaymentData(operationalPayment);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan(
      'read',
      'OperationalPayment',
    );

    const { page, size, courseId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.operationalPaymentRepo.findAll(
      offset,
      limit,
      courseId,
    );

    const dataRows = {
      count: ids.count,
      rows: await this.resolveOperationalPayments(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan(
      'create',
      'OperationalPayment',
    );

    Object.assign(req.body, {
      createdBy: req.user.userId,
    });

    const isCourseExist = await this.courseRepo.findById(req.body.courseId);
    if (!isCourseExist || isCourseExist === null) {
      throw new InvariantError(
        `${courseMessage.notFound} for courseId: ${req.body.courseId}`,
      );
    }

    const result = await this.operationalPaymentRepo.create(req.body);

    return this.resolveOperationalPaymentData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan(
      'update',
      'OperationalPayment',
    );

    const existingRegistrationPayment =
      await this.operationalPaymentRepo.findByOperationalPaymentId(
        req.params.id,
      );
    if (!existingRegistrationPayment) {
      throw new NotFoundError(operationalPaymentMessage.notFound);
    }

    if (req.body.courseId) {
      const isCourseExist = await this.courseRepo.findById(req.body.courseId);
      if (!isCourseExist || isCourseExist === null) {
        throw new InvariantError(
          `${courseMessage.notFound} for courseId: ${req.body.courseId}`,
        );
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.userId,
    });

    const result = await this.operationalPaymentRepo.update(req.body);

    return this.resolveOperationalPaymentData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'OperationalPayment');

    const registrationPayment =
      await this.operationalPaymentRepo.findByOperationalPaymentId(id);
    if (registrationPayment === null) {
      throw new NotFoundError(operationalPaymentMessage.notFound);
    }

    return this.operationalPaymentRepo.deleteByOperationalPaymentId(id, userId);
  }

  async resolveOperationalPayments(ids) {
    const operationalPayments = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const operationalPayment =
        await this.operationalPaymentRepo.findByOperationalPaymentId(nextID);

      if (operationalPayment == null) {
        logger.error(`${operationalPaymentMessage.null} ${nextID}`);
      } else {
        operationalPayments.push(
          await this.resolveOperationalPaymentData(operationalPayment),
        );
      }
    }, Promise.resolve());

    return operationalPayments;
  }

  async resolveOperationalPaymentData(operationalPayment) {
    const { deletedAt, deletedBy, ...operationalPaymentData } =
      operationalPayment;
    if (
      operationalPaymentData.courseId &&
      operationalPaymentData.courseId !== null
    ) {
      const course = await this.courseRepo.findById(
        operationalPaymentData.courseId,
      );
      if (course && course !== null) {
        delete course.deletedAt;
        delete course.deletedBy;

        Object.assign(operationalPaymentData, { course });
      }
    }

    return operationalPaymentData;
  }
}

module.exports = OperationalPaymentUsecase;
