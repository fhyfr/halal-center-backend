const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  course: courseMessage,
  category: categoryMessage,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class CourseUsecase {
  constructor(courseRepo, categoryRepo) {
    this.courseRepo = courseRepo;
    this.categoryRepo = categoryRepo;
  }

  async findByCourseId(ability, courseId, userId) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Course');

    const course = await this.courseRepo.findByCourseId(courseId);
    if (course === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    return this.resolveCourseData(course, userId);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Course');

    const { page, size, query, categoryId, userId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.courseRepo.findAll(
      offset,
      limit,
      query,
      categoryId,
      userId,
    );

    const dataRows = {
      count: ids.count,
      rows: await this.resolveCourses(ids.rows, req.user.userId),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Course');

    Object.assign(req.body, {
      createdBy: req.user.userId,
    });

    const isCategoryExist = await this.categoryRepo.findByCategoryId(
      req.body.categoryId,
    );
    if (!isCategoryExist) {
      throw new InvariantError(categoryMessage.notFound);
    }

    const result = await this.courseRepo.create(req.body);

    return this.resolveCourseData(result, req.user.userId);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Course');

    const existingCourse = await this.courseRepo.findByCourseId(
      req.params.courseId,
    );
    if (!existingCourse) {
      throw new NotFoundError(courseMessage.notFound);
    }

    const isCategoryExist = await this.categoryRepo.findByCategoryId(
      req.body.categoryId,
    );
    if (!isCategoryExist) {
      throw new InvariantError(categoryMessage.notFound);
    }

    Object.assign(req.body, {
      courseId: req.params.courseId,
      updatedBy: req.user.userId,
    });

    const result = await this.courseRepo.update(req.body);

    return this.resolveCourseData(result, req.user.userId);
  }

  async registerCourse(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('register', 'Course');
    const { courseId } = req.params;
    const { userId } = req.user;

    // check if course is exist
    const isCourseExist = await this.courseRepo.findByCourseId(courseId);
    if (!isCourseExist) {
      throw new NotFoundError(courseMessage.notFound);
    }

    // check if user already registered
    const isRegistrationExist =
      await this.courseRepo.findRegistrationByUserIdAndCourseId(
        userId,
        courseId,
      );
    if (isRegistrationExist) {
      throw new InvariantError(courseMessage.alreadyRegistered);
    }

    // check if quota is full
    if (isCourseExist.totalRegistered >= isCourseExist.quota) {
      throw new InvariantError(courseMessage.full);
    }

    return this.courseRepo.registerCourse(courseId, userId);
  }

  async delete(ability, courseId, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Course');

    const course = await this.courseRepo.findByCourseId(courseId);
    if (course === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    return this.courseRepo.deleteByCourseId(courseId, userId);
  }

  async resolveCourses(ids, userId) {
    const courses = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const course = await this.courseRepo.findByCourseId(nextID);

      if (course == null) {
        logger.error(`${courseMessage.null} ${nextID}`);
      } else if (userId && userId > 0) {
        courses.push(await this.resolveCourseData(course, userId));
      } else {
        courses.push(await this.resolveCourseData(course));
      }
    }, Promise.resolve());

    return courses;
  }

  async resolveCourseData(course, userId) {
    const { deletedAt, deletedBy, ...courseData } = course;
    let isRegistered = false;
    let registeredAt = null;

    if (userId && userId > 0) {
      const isRegistrationExist =
        await this.courseRepo.findRegistrationByUserIdAndCourseId(
          userId,
          courseData.courseId,
        );
      if (isRegistrationExist && isRegistrationExist !== null) {
        isRegistered = true;
        registeredAt = isRegistrationExist.createdAt;
      }
    }

    Object.assign(courseData, {
      isRegistered,
      registeredAt,
    });

    const courseCategory = await this.categoryRepo.findByCategoryId(
      courseData.categoryId,
    );

    if (courseCategory !== null) {
      delete courseCategory.deletedBy;
      delete courseCategory.deletedAt;

      Object.assign(courseData, {
        category: courseCategory,
      });
    }

    return courseData;
  }
}

module.exports = CourseUsecase;
