/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  score: scoreMessage,
  test: testMessage,
} = require('../helpers/responseMessage');
const logger = require('../helpers/logger');
const { getPagingData, getPagination } = require('../helpers/pagination');
const InvariantError = require('../exceptions/invariantError');

class ScoreUsecase {
  constructor(scoreRepo, testRepo, registrationRepo, excelJS) {
    this.scoreRepo = scoreRepo;
    this.testRepo = testRepo;
    this.registrationRepo = registrationRepo;
    this.excelJS = excelJS;
  }

  async findByScoreId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Score');

    const score = await this.scoreRepo.findByScoreId(id);
    if (score === null) {
      throw new NotFoundError(scoreMessage.notFound);
    }

    return this.resolveScoreData(score);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Score');

    const { page, size, testId, userId } = req.query;
    const { limit, offset } = getPagination(page, size);

    let ids = { count: 0, rows: [] };
    let registrationId = null;

    if (testId && testId > 0) {
      const test = await this.testRepo.findByTestId(testId);
      if (test !== null) {
        if (userId && userId > 0) {
          const registration =
            await this.registrationRepo.findByCourseIdAndUserId(
              test.courseId,
              userId,
            );
          if (registration !== null) {
            registrationId = registration.id;
            ids = await this.scoreRepo.findAll(
              offset,
              limit,
              testId,
              registrationId,
            );
          }
        } else {
          ids = await this.scoreRepo.findAll(offset, limit, testId);
        }
      }
    } else if (userId && userId > 0) {
      const registration = await this.registrationRepo.findByUserId(userId);
      if (registration !== null) {
        registrationId = registration.id;
        ids = await this.scoreRepo.findAll(offset, limit);
      }
    } else {
      ids = await this.scoreRepo.findAll(offset, limit);
    }

    const dataRows = {
      count: ids.count,
      rows: await this.resolveScores(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Score');

    // validate test
    const isTestExist = await this.testRepo.findByTestId(req.body.testId);
    if (!isTestExist || isTestExist === null) {
      throw new NotFoundError(testMessage.notFound);
    }

    // validate registration
    const isRegistrationExist =
      await this.registrationRepo.findByCourseIdAndUserId(
        isTestExist.courseId,
        req.body.userId,
      );
    if (!isRegistrationExist || isRegistrationExist === null) {
      throw new NotFoundError(
        `${scoreMessage.registrationNotFound} ${req.body.userId}`,
      );
    }

    // validate unique score
    const isScoreExist = await this.scoreRepo.findByTestIdAndRegistrationId(
      req.body.testId,
      isRegistrationExist.id,
    );
    if (isScoreExist && isScoreExist !== null) {
      throw new NotFoundError(
        `${scoreMessage.alreadyExist} ${req.body.userId}`,
      );
    }

    delete req.body.userId;
    Object.assign(req.body, {
      registrationId: isRegistrationExist.id,
      createdBy: req.user.id,
    });

    const result = await this.scoreRepo.create(req.body);
    return this.resolveScoreData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Score');

    let updatedRegistrationId;
    let isTestExist = null;

    // validate score
    const isScoreExist = await this.scoreRepo.findByScoreId(req.params.id);
    if (!isScoreExist || isScoreExist === null) {
      throw new NotFoundError(scoreMessage.notFound);
    }

    // validate test
    if (req.body.testId !== isScoreExist.testId) {
      isTestExist = await this.testRepo.findByTestId(req.body.testId);
      if (!isTestExist || isTestExist === null) {
        throw new NotFoundError(testMessage.notFound);
      }
    }

    // validate registration
    const existingRegistration =
      await this.registrationRepo.findByRegistrationId(
        isScoreExist.registrationId,
      );
    updatedRegistrationId = existingRegistration.id;

    if (req.body.userId !== existingRegistration.userId) {
      const isRegistrationExist =
        await this.registrationRepo.findByCourseIdAndUserId(
          isTestExist.courseId,
          req.body.userId,
        );
      if (!isRegistrationExist || isRegistrationExist === null) {
        throw new NotFoundError(
          `${scoreMessage.registrationNotFound} ${req.body.userId}`,
        );
      }

      updatedRegistrationId = isRegistrationExist.id;
    }

    delete req.body.userId;
    Object.assign(req.body, {
      id: req.params.id,
      registrationId: updatedRegistrationId,
      updatedBy: req.user.id,
    });

    const result = await this.scoreRepo.update(req.body);
    return this.resolveScoreData(result);
  }

  async delete(ability, id, deleterId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Score');

    // validate score
    const existingScore = await this.scoreRepo.findByScoreId(id);
    if (!existingScore || existingScore === null) {
      throw new NotFoundError(scoreMessage.notFound);
    }

    return this.scoreRepo.deleteById(id, deleterId);
  }

  async importScores(ability, file, createdBy) {
    ForbiddenError.from(ability).throwUnlessCan('create', 'Score');

    // read from uploaded excel file
    const workbook = new this.excelJS.Workbook();
    await workbook.xlsx.read([file.buffer]);

    const worksheet = workbook.getWorksheet(1);
    const scores = [];

    // validate worksheet
    if (worksheet === null && worksheet === undefined) {
      throw new Error(scoreMessage.importFailed);
    }

    // looping the worksheet and find test data for each row
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const scoreData = {
          testId: row.getCell(2).value,
          registrationId: row.getCell(3).value,
          userId: row.getCell(5).value,
          score: row.getCell(8).value,
        };

        // throw error if score data include null value
        Object.keys(scoreData).forEach((key) => {
          if (scoreData[key] === null) {
            throw new InvariantError(scoreMessage.includeNullValue);
          }
        });

        scores.push(scoreData);
      }
    });

    // insert scores data to database
    for (const score of scores) {
      const insertScoreData = {
        testId: score.testId,
        registrationId: score.registrationId,
        score: score.score,
        createdBy,
      };

      // validate test existence
      const isTestExist = await this.testRepo.findByTestId(score.testId);
      if (!isTestExist || isTestExist === null) {
        throw new NotFoundError(testMessage.notFound);
      }

      // validate registration existence
      const isRegistrationExist =
        await this.registrationRepo.findByRegistrationId(score.registrationId);
      if (!isRegistrationExist || isRegistrationExist === null) {
        throw new NotFoundError(
          `${scoreMessage.registrationNotFound} ${score.registrationId}`,
        );
      }

      // validate unique score
      const isScoreExist = await this.scoreRepo.findByTestIdAndRegistrationId(
        score.testId,
        score.registrationId,
      );
      if (isScoreExist && isScoreExist !== null) {
        throw new NotFoundError(`${scoreMessage.alreadyExist} ${score.userId}`);
      }

      // insert score data
      await this.scoreRepo.create(insertScoreData);
    }

    return scores;
  }

  async resolveScores(ids) {
    const scores = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const score = await this.scoreRepo.findByScoreId(nextID);

      if (score == null) {
        logger.error(`${scoreMessage.null} ${nextID}`);
      } else {
        scores.push(await this.resolveScoreData(score));
      }
    }, Promise.resolve());

    return scores;
  }

  async resolveScoreData(score) {
    const registration = await this.registrationRepo.findByRegistrationId(
      score.registrationId,
    );

    return {
      id: score.id,
      score: score.score,
      testId: score.testId,
      registration: {
        id: registration.id,
        userId: registration.userId,
        courseId: registration.courseId,
      },
      createdBy: score.createdBy,
      updatedBy: score.updatedBy,
      createdAt: score.createdAt,
      updatedAt: score.updatedAt,
    };
  }
}

module.exports = ScoreUsecase;
