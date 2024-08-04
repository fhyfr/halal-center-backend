const { presence: presenceMessage } = require('../helpers/responseMessage');

class PresenceController {
  constructor(presenceUsecase, validator) {
    this.presenceUsecase = presenceUsecase;
    this.validator = validator;

    this.findByPresenceId = this.findByPresenceId.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findByPresenceId(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const presence = await this.presenceUsecase.findByPresenceId(
        req.ability,
        req.params.id,
      );

      return res.respond(presence);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllPresencesPayload(req.query);

      const presences = await this.presenceUsecase.findAll(req);

      return res.respond(presences);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const presence = await this.presenceUsecase.create(req);

      return res.respond(
        { message: presenceMessage.create, data: presence },
        201,
      );
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.presenceUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({ message: presenceMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = PresenceController;
