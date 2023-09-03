const { module: moduleMessage } = require('../helpers/responseMessage');

class ModuleController {
  constructor(moduleUsecase, validator) {
    this.moduleUsecase = moduleUsecase;
    this.validator = validator;

    this.findByModuleId = this.findByModuleId.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findByModuleId(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const module = await this.moduleUsecase.findByModuleId(
        req.ability,
        req.params.id,
      );

      return res.respond(module);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllModulesPayload(req.query);
      const modules = await this.moduleUsecase.findAll(req);

      return res.respond(modules);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const module = await this.moduleUsecase.create(req);

      return res.respond({ message: moduleMessage.create, data: module }, 201);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.moduleUsecase.delete(req.ability, req.params.id, req.user.id);

      return res.respond({ message: moduleMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = ModuleController;
