const { employee: employeeMessage } = require('../helpers/responseMessage');

class EmployeeController {
  constructor(employeeUsecase, validator) {
    this.employeeUsecase = employeeUsecase;
    this.validator = validator;

    this.findById = this.findById.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.mutation = this.mutation.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findById(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const employee = await this.employeeUsecase.findById(
        req.ability,
        req.params.id,
      );

      return res.respond(employee);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllEmployeesPayload(req.query);

      const employees = await this.employeeUsecase.findAll(req);

      return res.respond(employees);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const employee = await this.employeeUsecase.create(req);

      return res.respond(
        { message: employeeMessage.create, data: employee },
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

      const employee = await this.employeeUsecase.update(req);

      return res.respond({
        message: employeeMessage.update,
        data: employee,
      });
    } catch (error) {
      return next(error);
    }
  }

  async mutation(req, res, next) {
    try {
      this.validator.validateMutationPayload({
        params: req.params,
        body: req.body,
      });

      const employee = await this.employeeUsecase.mutation(req);

      return res.respond({
        message: employeeMessage.update,
        data: employee,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.employeeUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({ message: employeeMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = EmployeeController;
