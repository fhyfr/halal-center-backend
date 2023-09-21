const { ForbiddenError } = require('@casl/ability');

const {
  test: testMessage,
  course: courseMessage,
} = require('../helpers/responseMessage');
const NotFoundError = require('../exceptions/notFoundError');
const logger = require('../helpers/logger');
const { getPagingData, getPagination } = require('../helpers/pagination');

class TestUsecase {
  constructor(testRepo, courseRepo, scoreRepo) {
    this.testRepo = testRepo;
    this.courseRepo = courseRepo;
    this.scoreRepo = scoreRepo;
  }

  async findByTestId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Test');

    const test = await this.testRepo.findByTestId(id);
    if (test === null) {
      throw new NotFoundError(testMessage.notFound);
    }

    return this.resolveTestData(test);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Test');

    const { page, size, courseId, type, active } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.testRepo.findAll(
      offset,
      limit,
      courseId,
      type,
      active,
    );

    const dataRows = {
      count: ids.count,
      rows: await this.resolveTests(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Test');

    // validate course
    const isCourseExist = await this.courseRepo.findById(req.body.courseId);
    if (!isCourseExist || isCourseExist === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const result = await this.testRepo.create(req.body);
    return this.resolveTestData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Test');

    // validate test
    const existingTest = await this.testRepo.findByTestId(req.params.id);
    if (!existingTest || existingTest === null) {
      throw new NotFoundError(testMessage.notFound);
    }

    // validate course
    if (req.body.courseId !== existingTest.courseId) {
      const isCourseExist = await this.courseRepo.findById(req.body.courseId);
      if (!isCourseExist || isCourseExist === null) {
        throw new NotFoundError(courseMessage.notFound);
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    const result = await this.testRepo.update(req.body);
    return this.resolveTestData(result);
  }

  async delete(ability, id, deleterId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Test');

    // validate test
    const existingTest = await this.testRepo.findByTestId(id);
    if (!existingTest || existingTest === null) {
      throw new NotFoundError(testMessage.notFound);
    }

    return this.testRepo.deleteById(id, deleterId);
  }

  async resolveTests(ids) {
    const tests = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const test = await this.testRepo.findByTestId(nextID);

      if (test == null) {
        logger.error(`${testMessage.null} ${nextID}`);
      } else {
        tests.push(await this.resolveTestData(test));
      }
    }, Promise.resolve());

    return tests;
  }

  async resolveTestData(test) {
    const { deletedAt, deletedBy, ...testData } = test;
    let courseData = {};

    const course = await this.courseRepo.findById(test.courseId);
    if (course !== null) {
      const {
        id,
        deletedAt: deletedAtCourse,
        deletedBy: deletedByCourse,
        ...restCourse
      } = course;

      courseData = { ...restCourse };
    }

    const totalScoreData = await this.scoreRepo.countTotalScoreDataByTestId(
      test.id,
    );

    Object.assign(testData, {
      totalScoreData,
      course: courseData,
    });

    return testData;
  }
}

module.exports = TestUsecase;
