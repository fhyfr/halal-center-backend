const { role: roleMessage } = require('../helpers/responseMessage');

class RoleController {
  constructor(roleUsecase, validator) {
    this.roleUsecase = roleUsecase;
    this.validator = validator;

    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllRolesPayload(req.query);

      const roles = await this.roleUsecase.findAll(req);

      return res.respond(roles);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreateRolePayload(req.body);

      const role = await this.roleUsecase.create(req.ability, req.body);
      return res.respond(
        {
          message: roleMessage.create,
          data: role,
        },
        201,
      );
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = RoleController;
