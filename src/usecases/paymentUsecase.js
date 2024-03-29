const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  payment: paymentMessage,
  course: courseMessage,
  user: userMessage,
  getPublicUserProperties,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class PaymentUsecase {
  constructor(paymentRepo, courseRepo, userRepo) {
    this.paymentRepo = paymentRepo;
    this.courseRepo = courseRepo;
    this.userRepo = userRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Payment');

    const payment = await this.paymentRepo.findById(id);
    if (payment === null) {
      throw new NotFoundError(paymentMessage.notFound);
    }

    return this.resolvePaymentData(payment);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Payment');

    const { page, size, courseId, userId, type } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.paymentRepo.findAll(
      offset,
      limit,
      courseId,
      userId,
      type,
    );

    const dataRows = {
      count: ids.count,
      rows: await this.resolvePayments(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Payment');

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const isCourseExist = await this.courseRepo.findById(req.body.courseId);
    if (!isCourseExist || isCourseExist === null) {
      throw new InvariantError(
        `${courseMessage.notFound} for id: ${req.body.courseId}`,
      );
    }

    if (req.body.userId) {
      const isUserExist = await this.userRepo.findById(req.body.userId);
      if (!isUserExist || isUserExist === null) {
        throw new InvariantError(
          `${userMessage.notFound} for id ${req.body.userId}`,
        );
      }
    }

    const result = await this.paymentRepo.create(req.body);

    return this.resolvePaymentData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Payment');

    const existingPayment = await this.paymentRepo.findById(req.params.id);
    if (!existingPayment) {
      throw new NotFoundError(paymentMessage.notFound);
    }

    if (req.body.courseId) {
      const isCourseExist = await this.courseRepo.findById(req.body.courseId);
      if (!isCourseExist || isCourseExist === null) {
        throw new InvariantError(
          `${courseMessage.notFound} for id: ${req.body.courseId}`,
        );
      }
    }

    if (req.body.userId) {
      const isUserExist = await this.userRepo.findById(req.body.userId);
      if (!isUserExist || isUserExist === null) {
        throw new InvariantError(
          `${userMessage.notFound} for id ${req.body.userId}`,
        );
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    const result = await this.paymentRepo.update(req.body);

    return this.resolvePaymentData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Payment');

    const payment = await this.paymentRepo.findById(id);
    if (payment === null) {
      throw new NotFoundError(paymentMessage.notFound);
    }

    return this.paymentRepo.deleteById(id, userId);
  }

  async resolvePayments(ids) {
    const payments = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const payment = await this.paymentRepo.findById(nextID);

      if (payment == null) {
        logger.error(`${paymentMessage.null} ${nextID}`);
      } else {
        payments.push(await this.resolvePaymentData(payment));
      }
    }, Promise.resolve());

    return payments;
  }

  async resolvePaymentData(payment) {
    const { deletedAt, deletedBy, ...paymentData } = payment;
    if (paymentData.courseId && paymentData.courseId !== null) {
      const course = await this.courseRepo.findById(paymentData.courseId);
      if (course && course !== null) {
        delete course.deletedAt;
        delete course.deletedBy;

        Object.assign(paymentData, { course });
      }
    }

    if (paymentData.userId && paymentData.userId !== null) {
      const user = await this.userRepo.findById(paymentData.userId);
      if (user && user !== null) {
        Object.assign(paymentData, { user: getPublicUserProperties(user) });
      }
    }

    return paymentData;
  }
}

module.exports = PaymentUsecase;
