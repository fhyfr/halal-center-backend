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

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Course');

    const course = await this.courseRepo.findById(id);

    if (course === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    return this.resolveCourseData(course);
  }

  async findAll(req) {
    const { page, size, query, categoryId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.courseRepo.findAll(offset, limit, query, categoryId);

    const dataRows = {
      count: ids.count,
      rows: await this.resolveCourses(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Course');

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const isCategoryExist = await this.categoryRepo.findById(
      req.body.categoryId,
    );
    if (!isCategoryExist) {
      throw new InvariantError(categoryMessage.notFound);
    }

    const result = await this.courseRepo.create(req.body);

    return this.resolveCourseData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Course');

    const existingCourse = await this.courseRepo.findById(req.params.id);
    if (!existingCourse) {
      throw new NotFoundError(courseMessage.notFound);
    }

    const isCategoryExist = await this.categoryRepo.findById(
      req.body.categoryId,
    );
    if (!isCategoryExist) {
      throw new InvariantError(categoryMessage.notFound);
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    const result = await this.courseRepo.update(req.body);

    return this.resolveCourseData(result);
  }

  async registerCourse(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('register', 'Course');
    const { courseId } = req.params;
    const { id: userId } = req.user;

    // check if course is exist
    const isCourseExist = await this.courseRepo.findById(courseId);
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

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Course');

    const course = await this.courseRepo.findById(id);
    if (course === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    return this.courseRepo.deleteById(id, userId);
  }

  async resolveCourses(ids) {
    const courses = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const course = await this.courseRepo.findById(nextID);

      if (course == null) {
        logger.error(`${courseMessage.null} ${nextID}`);
      } else {
        courses.push(await this.resolveCourseData(course));
      }
    }, Promise.resolve());

    return courses;
  }

  async resolveCourseData(course) {
    const { deletedAt, deletedBy, ...courseData } = course;

    const courseCategory = await this.categoryRepo.findById(
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
