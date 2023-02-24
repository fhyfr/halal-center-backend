const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  promotion: promotionMessage,
  course: courseMessage,
  user: userMessage,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');
const { sendEmail } = require('../email/sendEmail');

class PromotionUsecase {
  constructor(promotionRepo, courseRepo, userRepo) {
    this.promotionRepo = promotionRepo;
    this.courseRepo = courseRepo;
    this.userRepo = userRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Promotion');

    const promotion = await this.promotionRepo.findById(id);

    if (promotion === null) {
      throw new NotFoundError(promotionMessage.notFound);
    }

    return this.constructor.resolvePromotionData(promotion);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Promotion');

    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.promotionRepo.findAll(offset, limit);

    const dataRows = {
      count: ids.count,
      rows: await this.resolvePromotions(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Promotion');

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const emailCourses = [];

    // validate if courses is exist
    // eslint-disable-next-line no-restricted-syntax
    for (const courseId of req.body.courseIds) {
      // eslint-disable-next-line no-await-in-loop
      const isCourseExist = await this.courseRepo.findById(courseId);
      if (!isCourseExist) {
        throw new InvariantError(
          `${courseMessage.notFound} for id: ${courseId}`,
        );
      }

      emailCourses.push({
        title: isCourseExist.title,
        subTitle: isCourseExist.subTitle,
        price: isCourseExist.price,
        level: isCourseExist.level,
      });
    }

    const isUserExist = await this.userRepo.findById(req.body.receiverId);
    if (!isUserExist || isUserExist === null) {
      throw new InvariantError(
        `${userMessage.notFound} for id: ${req.body.receiverId}`,
      );
    }

    const result = await this.promotionRepo.create(req.body);

    sendEmail('promotion', isUserExist.email, {
      username: isUserExist.username,
      subject: result.subject,
      courses: emailCourses,
    });

    return this.constructor.resolvePromotionData(result);
  }

  async resend(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('resend', 'Promotion');

    const existingPromotion = await this.promotionRepo.findById(req.params.id);
    if (!existingPromotion) {
      throw new NotFoundError(promotionMessage.notFound);
    }

    const emailCourses = [];

    // validate if courses is exist
    // eslint-disable-next-line no-restricted-syntax
    for (const courseId of existingPromotion.courseIds) {
      // eslint-disable-next-line no-await-in-loop
      const isCourseExist = await this.courseRepo.findById(courseId);
      if (!isCourseExist) {
        throw new InvariantError(
          `${courseMessage.notFound} for id: ${courseId}`,
        );
      }

      emailCourses.push({
        title: isCourseExist.title,
        subTitle: isCourseExist.subTitle,
        price: isCourseExist.price,
        level: isCourseExist.level,
      });
    }

    const user = await this.userRepo.findById(existingPromotion.receiverId);
    if (!user) {
      throw new Error('failed to resend promotion');
    }

    sendEmail('promotion', user.email, {
      username: user.username,
      subject: existingPromotion.subject,
      courses: emailCourses,
    });

    return true;
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Promotion');

    const promotion = await this.promotionRepo.findById(id);
    if (!promotion || promotion === null) {
      throw new NotFoundError(promotionMessage.notFound);
    }

    return this.promotionRepo.deleteById(id, userId);
  }

  async resolvePromotions(ids) {
    const promotions = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const promotion = await this.promotionRepo.findById(nextID);

      if (promotion == null) {
        logger.error(`${promotionMessage.null} ${nextID}`);
      } else {
        promotions.push(this.constructor.resolvePromotionData(promotion));
      }
    }, Promise.resolve());

    return promotions;
  }

  static resolvePromotionData(promotion) {
    const { deletedAt, deletedBy, ...promotionData } = promotion;

    return promotionData;
  }
}

module.exports = PromotionUsecase;
