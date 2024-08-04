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
  constructor(courseRepo, categoryRepo, instructorRepo) {
    this.courseRepo = courseRepo;
    this.categoryRepo = categoryRepo;
    this.instructorRepo = instructorRepo;
  }

  async findById(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Course');

    const course = await this.courseRepo.findById(id);

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
      rows: await this.resolveCourses(ids.rows, req.user.id),
    };

    return getPagingData(dataRows, page, limit);
  }

  async findAllCoursesOfInstructor(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Course');

    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    let dataRows = {};

    const instructor = await this.instructorRepo.findByUserId(req.params.id);
    if (instructor === null) {
      dataRows = {
        count: 0,
        rows: [],
      };
    } else {
      const ids = await this.courseRepo.findAllCoursesByInstructor(
        offset,
        limit,
        instructor.id,
      );

      dataRows = {
        count: ids.count,
        rows: await this.resolveCourses(ids.rows),
      };
    }

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

    return this.resolveCourseData(result, req.user.id);
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

    return this.resolveCourseData(result, req.user.id);
  }

  async registerCourse(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('register', 'Course');
    const { courseId } = req.params;
    const { id: userId } = req.user;

    // check if course is exist
    const isCourseExist = await this.courseRepo.findById(courseId);
    if (!isCourseExist || isCourseExist === null) {
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

    // validate course
    const isCourseExist = await this.courseRepo.findById(id);
    if (!isCourseExist || isCourseExist === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    return this.courseRepo.deleteById(id, userId);
  }

  async resolveCourses(ids, userId) {
    const courses = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const course = await this.courseRepo.findById(nextID);

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
    let registrationId;

    if (userId && userId > 0) {
      const isRegistrationExist =
        await this.courseRepo.findRegistrationByUserIdAndCourseId(
          userId,
          courseData.id,
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

    if (isRegistered === true) {
      const getRegistrationId =
        await this.courseRepo.findRegistrationByUserIdAndCourseId(
          userId,
          courseData.id,
        );
      registrationId = getRegistrationId.id;
      Object.assign(courseData, {
        registrationId,
      });
    }

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
