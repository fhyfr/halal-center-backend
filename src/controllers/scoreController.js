const InvariantError = require('../exceptions/invariantError');
const { formatBytes } = require('../helpers/conversion');
const {
  score: scoreMessage,
  upload: uploadMessage,
} = require('../helpers/responseMessage');

const { MAX_DOCUMENT_SIZE_IN_BYTES } = process.env;

class ScoreController {
  constructor(scoreUsecase, validator) {
    this.scoreUsecase = scoreUsecase;
    this.validator = validator;

    this.findByScoreId = this.findByScoreId.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.importScores = this.importScores.bind(this);
  }

  async findByScoreId(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const score = await this.scoreUsecase.findByScoreId(
        req.ability,
        req.params.id,
      );

      return res.respond(score);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllScoresPayload(req.query);

      const scores = await this.scoreUsecase.findAll(req);

      return res.respond(scores);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const score = await this.scoreUsecase.create(req);

      return res.respond({ message: scoreMessage.create, data: score }, 201);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      this.validator.validateUpdatePayload({
        params: req.params,
        body: req.body,
      });

      const score = await this.scoreUsecase.update(req);

      return res.respond({ message: scoreMessage.update, data: score });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.scoreUsecase.delete(req.ability, req.params.id, req.user.id);

      return res.respond({ message: scoreMessage.delete });
    } catch (error) {
      return next(error);
    }
  }

  async importScores(req, res, next) {
    try {
      if (!req.file) throw new Error(scoreMessage.importFailed);

      if (req.file.size > MAX_DOCUMENT_SIZE_IN_BYTES) {
        throw new InvariantError(
          `${uploadMessage.sizeTooLarge}, max is ${formatBytes(
            MAX_DOCUMENT_SIZE_IN_BYTES,
          )}`,
        );
      }

      const result = await this.scoreUsecase.importScores(
        req.ability,
        req.file,
        req.user.id,
      );

      return res.respond({
        message: scoreMessage.importSuccess,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = ScoreController;
