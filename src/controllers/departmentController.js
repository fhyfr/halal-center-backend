const { department: departmentMessage } = require('../helpers/responseMessage');

class DepartmentController {
  constructor(departmentUsecase, validator) {
    this.departmentUsecase = departmentUsecase;
    this.validator = validator;

    this.findById = this.findById.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findById(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const department = await this.departmentUsecase.findById(
        req.ability,
        req.params.id,
      );

      return res.respond(department);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllDepartmentsPayload(req.query);

      const departments = await this.departmentUsecase.findAll(req);

      return res.respond(departments);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const department = await this.departmentUsecase.create(req);

      return res.respond(
        { message: departmentMessage.create, data: department },
        201,
      );
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

      const department = await this.departmentUsecase.update(req);

      return res.respond({
        message: departmentMessage.update,
        data: department,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.departmentUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({ message: departmentMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = DepartmentController;
