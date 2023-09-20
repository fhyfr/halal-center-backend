const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  score: scoreMessage,
  test: testMessage,
} = require('../helpers/responseMessage');
const logger = require('../helpers/logger');
const { getPagingData, getPagination } = require('../helpers/pagination');

class ScoreUsecase {
  constructor(scoreRepo, testRepo, registrationRepo) {
    this.scoreRepo = scoreRepo;
    this.testRepo = testRepo;
    this.registrationRepo = registrationRepo;
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

    let ids;
    let registration;
    let registrationId = null;

    const { page, size, testId, userId } = req.query;
    const { limit, offset } = getPagination(page, size);

    if (userId && userId > 0) {
      registration = await this.registrationRepo.findByUserId(userId);
      if (registration === null) {
        ids = {
          count: 0,
          rows: [],
        };
      } else {
        registrationId = registration.id;

        ids = await this.scoreRepo.findAll(
          offset,
          limit,
          testId,
          registrationId,
        );
      }
    } else {
      ids = await this.scoreRepo.findAll(offset, limit, testId, registrationId);
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
    const isRegistrationExist = await this.registrationRepo.findByUserId(
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

    // validate score
    const isScoreExist = await this.scoreRepo.findByScoreId(req.params.id);
    if (!isScoreExist || isScoreExist === null) {
      throw new NotFoundError(scoreMessage.notFound);
    }

    // validate test
    if (req.body.testId !== isScoreExist.testId) {
      const isTestExist = await this.testRepo.findByTestId(req.body.testId);
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
      const isRegistrationExist = await this.registrationRepo.findByUserId(
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
