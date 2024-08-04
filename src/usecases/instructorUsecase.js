/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
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
    mentorRepo,
    userRepo,
    provinceRepo,
    cityRepo,
  ) {
    this.instructorRepo = instructorRepo;
    this.courseRepo = courseRepo;
    this.mentorRepo = mentorRepo;
    this.userRepo = userRepo;
    this.provinceRepo = provinceRepo;
    this.cityRepo = cityRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Instructor');

    const instructor = await this.instructorRepo.findByUserId(id);

    if (instructor === null) {
      throw new NotFoundError(instructorMessage.notFound);
    }
    return this.resolveInstructorData(instructor);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Instructor');

    const { page, size, query, courseId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.instructorRepo.findAll(
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
      const isCourseExist = await this.courseRepo.findById(courseId);
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
      userId: newUser.id,
      createdBy: req.user.id,
    });

    const result = await this.instructorRepo.create(createInstructorArguments);

    if (result && result !== null) {
      // eslint-disable-next-line no-restricted-syntax
      for (const courseId of courseIds) {
        const mentor = {
          instructorId: result.id,
          courseId,
        };

        return this.mentorRepo.create(mentor);
      }
    }

    return this.resolveInstructorData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Instructor');

    const existingInstructor = await this.instructorRepo.findByUserId(
      req.params.id,
    );
    if (!existingInstructor) {
      throw new NotFoundError(instructorMessage.notFound);
    }

    // validate unique email
    const isEmailExist = await this.userRepo.findByEmail(
      req.body.email.toLowerCase(),
    );
    if (isEmailExist && isEmailExist.id !== existingInstructor.userId) {
      throw new InvariantError(
        `${instructorMessage.emailExist} ${req.body.email}`,
      );
    }

    // validate unique username
    const isUsernameExist = await this.checkUsername(req.body.username);
    if (
      isUsernameExist &&
      isUsernameExist.username !== existingInstructor.username
    ) {
      throw new InvariantError(
        `${instructorMessage.usernameExist} ${req.body.username}`,
      );
    }

    // validate if courses is exist
    if (req.body.courseIds && req.body.courseIds.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const courseId of req.body.courseIds) {
        // eslint-disable-next-line no-await-in-loop
        const isCourseExist = await this.courseRepo.findById(courseId);
        if (!isCourseExist) {
          throw new InvariantError(
            `${courseMessage.notFound} for id: ${courseId}`,
          );
        }
      }
    }

    const { username, email, courseIds, ...updateInstructorData } = req.body;

    Object.assign(updateInstructorData, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    await this.userRepo.update(req.params.id, {
      username: username.toLowerCase(),
      email: email.toLowerCase(),
    });

    const result = await this.instructorRepo.update(updateInstructorData);
    if (result && result !== null && courseIds && courseIds.length > 0) {
      // delete old mentors data
      await this.mentorRepo.deleteByInstructorIdOrCourseId(result.id);

      for (const courseId of courseIds) {
        // add new mentors data
        await this.mentorRepo.create({
          instructorId: result.id,
          courseId,
        });
      }
    }

    return this.resolveInstructorData(result);
  }

  async delete(ability, id, deleterId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Instructor');

    const instructor = await this.instructorRepo.findByUserId(id);
    if (instructor === null) {
      throw new NotFoundError(instructorMessage.notFound);
    }

    const user = await this.userRepo.findById(instructor.userId);
    if (user === null) {
      throw new NotFoundError(instructorMessage.notFound);
    }

    await this.userRepo.deleteById(
      user.id,
      user.username,
      user.email,
      deleterId,
    );

    return this.instructorRepo.deleteById(id, deleterId, instructor.userId);
  }

  async resolveInstructors(ids) {
    const instructors = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const instructor = await this.instructorRepo.findByUserId(nextID);

      if (instructor == null) {
        logger.error(`${instructorMessage.null} ${nextID}`);
      } else {
        instructors.push(await this.resolveInstructorData(instructor));
      }
    }, Promise.resolve());

    return instructors;
  }

  async checkUsername(username) {
    const isUsernameExist = await this.userRepo.findByUsername(
      username.toLowerCase(),
    );

    return isUsernameExist !== null;
  }

  async resolveInstructorData(instructor) {
    const user = await this.userRepo.findById(instructor.userId);
    const province = await this.provinceRepo.findByProvinceId(
      instructor.provinceId,
    );
    const city = await this.cityRepo.findByCityId(instructor.cityId);

    return getPublicUserProperties(user, null, instructor, province, city);
  }
}

module.exports = InstructorUsecase;
