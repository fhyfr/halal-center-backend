const Models = require('./models');
const logger = require('../helpers/logger');

class ScoreRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.scoreModel = Models.Score;
  }

  async findByScoreId(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const score = await this.cacheService.get(cacheKey);

      return JSON.parse(score);
    } catch (error) {
      const score = await this.scoreModel.findOne({
        where: { id },
        raw: true,
      });
      if (score === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(score));
      return score;
    }
  }

  async findAll(offset, limit, testId, registrationId) {
    const whereConditions = {};

    if (testId && testId > 0) {
      Object.assign(whereConditions, { testId });
    }

    if (registrationId && registrationId !== null) {
      Object.assign(whereConditions, { registrationId });
    }

    const scores = await this.scoreModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      where: whereConditions,
      offset,
      limit,
      raw: true,
    });

    return {
      count: scores.count,
      rows: scores.rows.map((score) => score.id),
    };
  }

  async findByTestIdAndRegistrationId(testId, registrationId) {
    // TODO: implement caching for this method
    // create new cache key by testId and registrationId
    const score = await this.scoreModel.findOne({
      where: { testId, registrationId },
      raw: true,
    });

    if (score === null) return null;

    return score;
  }

  async countTotalScoreDataByTestId(testId) {
    return this.scoreModel.count({ where: { testId } });
  }

  async create(newScore) {
    const result = await this.scoreModel.create(newScore);

    if (result === null) {
      logger.error('failed to create new score');
      throw new Error('failed to create new score');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);
    await this.cacheService.set(cacheKeyId, JSON.stringify(result));

    return result.dataValues;
  }

  async update(score) {
    const result = await this.scoreModel.update(score, {
      where: { id: score.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      logger.error('failed to update score');
      throw new Error('failed to update score');
    }

    const cacheKey = this.constructor.cacheKeyById(score.id);
    await this.cacheService.delete(cacheKey);

    return result[1][0];
  }

  async deleteById(id, deleterId) {
    const result = await this.scoreModel.destroy({
      where: { id },
    });

    if (result === 0) {
      logger.error('failed to delete score');
      throw new Error('failed to delete score');
    }

    await this.scoreModel.update(
      { deletedBy: deleterId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyById(id);
    await this.cacheService.delete(cacheKey);

    return result;
  }

  static cacheKeyById(id) {
    return `score:${id}`;
  }
}

module.exports = ScoreRepository;
