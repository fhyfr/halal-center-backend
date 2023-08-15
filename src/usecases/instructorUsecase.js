const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  instructor: instructorMessage,
  course: courseMessage,
  getPublicUserProperties,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');
const { role } = require('../helpers/constant');
const { encryptPassword } = require('../helpers/encryption');

class InstructorUsecase {
  constructor(
    instructorRepo,
    courseRepo,
    instructorCourseRepo,
    userRepo,
    provinceRepo,
    cityRepo,
  ) {
    this.instructorRepo = instructorRepo;
    this.courseRepo = courseRepo;
    this.instructorCourseRepo = instructorCourseRepo;
    this.userRepo = userRepo;
    this.provinceRepo = provinceRepo;
    this.cityRepo = cityRepo;
  }

  async findByInstructorId(ability, instructorId) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Instructor');

    const instructor = await this.instructorRepo.findByInstructorId(
      instructorId,
    );
    if (instructor === null) {
      throw new NotFoundError(instructorMessage.notFound);
    }

    return this.resolveInstructorData(instructor);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Instructor');

    const { page, size, query, courseId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.instructorCourseRepo.findAll(
      offset,
      limit,
      query,
      courseId,
    );

    const dataRows = {
      count: ids.count,
      rows: await this.resolveInstructors(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Instructor');

    const { courseIds, email, ...createInstructorArguments } = req.body;

    // validate if courses is exist
    // eslint-disable-next-line no-restricted-syntax
    for (const courseId of courseIds) {
      // eslint-disable-next-line no-await-in-loop
      const isCourseExist = await this.courseRepo.findByCourseId(courseId);
      if (!isCourseExist) {
        throw new InvariantError(
          `${courseMessage.notFound} for courseId: ${courseId}`,
        );
      }
    }

    // validate unique email
    const isEmailExist = await this.userRepo.findByEmail(email.toLowerCase());
    if (isEmailExist) {
      throw new InvariantError(
        `${instructorMessage.emailExist} ${isEmailExist.email}`,
      );
    }

    // validate unique username
    const isUsernameExist = await this.checkUsername(
      createInstructorArguments.username,
    );
    if (isUsernameExist) {
      throw new InvariantError(
        `${instructorMessage.usernameExist} ${createInstructorArguments.username}`,
      );
    }

    const encryptedPassword = await encryptPassword(
      createInstructorArguments.password,
    );

    const newUser = await this.userRepo.create({
      roleId: role.INSTRUCTOR.ID,
      username: createInstructorArguments.username.toLowerCase(),
      password: encryptedPassword,
      email: email.toLowerCase(),
    });

    Object.assign(createInstructorArguments, {
      userId: newUser.userId,
      createdBy: req.user.userId,
    });

    const result = await this.instructorRepo.create(createInstructorArguments);

    if (result && result !== null) {
      // eslint-disable-next-line no-restricted-syntax
      for (const courseId of courseIds) {
        const instructorCourse = {
          instructorId: result.instructorId,
          courseId,
        };

        return this.instructorCourseRepo.create(instructorCourse);
      }
    }

    return this.resolveInstructorData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Instructor');

    const existingInstructor = await this.instructorRepo.findByInstructorId(
      req.params.instructorId,
    );
    if (!existingInstructor) {
      throw new NotFoundError(instructorMessage.notFound);
    }

    // validate if courses is exist
    if (req.body.courseIds && req.body.courseIds.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const courseId of req.body.courseIds) {
        // eslint-disable-next-line no-await-in-loop
        const isCourseExist = await this.courseRepo.findByCourseId(courseId);
        if (!isCourseExist) {
          throw new InvariantError(
            `${courseMessage.notFound} for course: ${courseId}`,
          );
        }
      }
    }

    // validate unique email
    if (req.body.email && req.body.email !== '') {
      const isEmailExist = await this.userRepo.findByEmail(
        req.body.email.toLowerCase(),
      );
      if (isEmailExist && isEmailExist.userId !== existingInstructor.userId) {
        throw new InvariantError(
          `${instructorMessage.emailExist} ${isEmailExist.email}`,
        );
      }
    }

    Object.assign(req.body, {
      instructorId: req.params.instructorId,
      updatedBy: req.user.userId,
    });

    const result = await this.instructorRepo.update(req.body);

    // if client try to changes the course ids
    // then update the instructor course records
    if (req.body.courseIds && req.body.courseIds.length > 0) {
      const existingInstructorCourseIds =
        await this.instructorCourseRepo.findAllByInstructorId(
          req.params.instructorId,
        );

      if (existingInstructorCourseIds.rows !== req.body.courseIds) {
        // eslint-disable-next-line no-restricted-syntax
        for (const courseId of req.body.courseIds) {
          const instructorCourse = {
            instructorId: req.params.instructorId,
            courseId,
          };

          // eslint-disable-next-line no-await-in-loop
          await this.instructorCourseRepo.deleteByInstructorIdOrCourseId(
            req.params.instructorId,
            courseId,
          );

          return this.instructorCourseRepo.create(instructorCourse);
        }
      }
    }

    return this.resolveInstructorData(result);
  }

  async delete(ability, instructorId, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Instructor');

    const instructor = await this.instructorRepo.findByInstructorId(
      instructorId,
    );
    if (instructor === null) {
      throw new NotFoundError(instructorMessage.notFound);
    }

    return this.instructorRepo.deleteByInstructorId(
      instructorId,
      userId,
      instructor.email,
    );
  }

  async resolveInstructors(ids) {
    const instructors = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const instructor = await this.instructorRepo.findByInstructorId(nextID);

      if (instructor == null) {
        logger.error(`${instructorMessage.null} ${nextID}`);
      } else {
        instructors.push(await this.resolveInstructorData(instructor));
      }
    }, Promise.resolve());

    return instructors;
  }

  async resolveInstructorData(instructor) {
    const user = await this.userRepo.findByUserId(instructor.userId);
    const province = await this.provinceRepo.findByProvinceId(
      instructor.provinceId,
    );
    const city = await this.cityRepo.findByCityId(instructor.cityId);

    return getPublicUserProperties(user, null, instructor, province, city);
  }

  async checkUsername(username) {
    const isUsernameExist = await this.userRepo.findByUsername(
      username.toLowerCase(),
    );

    return isUsernameExist !== null;
  }
}

module.exports = InstructorUsecase;
