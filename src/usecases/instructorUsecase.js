const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  instructor: instructorMessage,
  course: courseMessage,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class InstructorUsecase {
  constructor(instructorRepo, courseRepo) {
    this.instructorRepo = instructorRepo;
    this.courseRepo = courseRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Instructor');

    const instructor = await this.instructorRepo.findById(id);

    if (instructor === null) {
      throw new NotFoundError(instructorMessage.notFound);
    }

    return this.constructor.resolveInstructorData(instructor);
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
          `${courseMessage.notFound} for id: ${courseId}`,
        );
      }
    }

    // validate unique email
    const isEmailExist = await this.instructorRepo.findByEmail(
      email.toLowerCase(),
    );
    if (isEmailExist) {
      throw new InvariantError(
        `${instructorMessage.emailExist} ${isEmailExist.email}`,
      );
    }

    Object.assign(createInstructorArguments, {
      courseIds,
      email: email.toLowerCase(),
      createdBy: req.user.id,
    });

    const result = await this.instructorRepo.create(createInstructorArguments);

    return this.constructor.resolveInstructorData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Instructor');

    const existingInstructor = await this.instructorRepo.findById(
      req.params.id,
    );
    if (!existingInstructor) {
      throw new NotFoundError(instructorMessage.notFound);
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

    // validate unique email
    if (req.body.email && req.body.email !== '') {
      req.body.email.toLowerCase();
      if (req.body.email) {
        const isEmailExist = await this.instructorRepo.findByEmail(
          req.body.email.toLowerCase(),
        );
        if (
          isEmailExist &&
          isEmailExist.id.toString() !== req.params.id.toString()
        ) {
          throw new InvariantError(
            `${instructorMessage.emailExist} ${isEmailExist.email}`,
          );
        }
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    const result = await this.instructorRepo.update(req.body);

    return this.constructor.resolveInstructorData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Instructor');

    const instructor = await this.instructorRepo.findById(id);
    if (instructor === null) {
      throw new NotFoundError(instructorMessage.notFound);
    }

    return this.instructorRepo.deleteById(id, userId, instructor.email);
  }

  async resolveInstructors(ids) {
    const instructors = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const instructor = await this.instructorRepo.findById(nextID);

      if (instructor == null) {
        logger.error(`${instructorMessage.null} ${nextID}`);
      } else {
        instructors.push(
          await this.constructor.resolveInstructorData(instructor),
        );
      }
    }, Promise.resolve());

    return instructors;
  }

  static resolveInstructorData(instructor) {
    const { deletedAt, deletedBy, ...instructorData } = instructor;

    return instructorData;
  }
}

module.exports = InstructorUsecase;
