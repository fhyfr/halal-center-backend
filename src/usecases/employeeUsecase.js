const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const { employee: employeeMessage } = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class EmployeeUsecase {
  constructor(employeeRepo) {
    this.employeeRepo = employeeRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('findById', 'Employee');

    const employee = await this.employeeRepo.findById(id);

    if (employee === null) {
      throw new NotFoundError(employeeMessage.notFound);
    }

    return this.constructor.resolveEmployeeData(employee);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('findAll', 'Employee');

    const { page, size, query } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.employeeRepo.findAll(offset, limit, query);

    const dataRows = {
      count: ids.count,
      rows: await this.resolveEmployees(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async isEmployeeNameExist(employeeName) {
    const existingEmployee = await this.employeeRepo.findByEmployeeName(
      employeeName.toLowerCase(),
    );

    return existingEmployee !== null;
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Employee');

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const checkEmployeeName = await this.isEmployeeNameExist(
      req.body.employeeName,
    );
    if (checkEmployeeName) {
      throw new InvariantError(employeeMessage.exist);
    }

    const result = await this.employeeRepo.create(req.body);

    return this.constructor.resolveEmployeeData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Employee');

    const existingEmployee = await this.employeeRepo.findById(req.params.id);
    if (!existingEmployee) {
      throw new NotFoundError(employeeMessage.notFound);
    }

    const isEmployeeNameExist = await this.employeeRepo.findByEmployeeName(
      req.body.employeeName.toLowerCase(),
    );

    if (isEmployeeNameExist) {
      if (isEmployeeNameExist.id.toString() !== req.params.id.toString()) {
        throw new InvariantError(employeeMessage.exist);
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    const result = await this.employeeRepo.update(req.body);

    return this.constructor.resolveEmployeeData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Employee');

    const employee = await this.employeeRepo.findById(id);
    if (employee === null) {
      throw new NotFoundError(employeeMessage.notFound);
    }

    // TODO: check employees data inside employee, is employee empty or not

    return this.employeeRepo.deleteById(id, userId);
  }

  async resolveEmployees(ids) {
    const employees = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const employee = await this.employeeRepo.findById(nextID);

      if (employee == null) {
        logger.error(`${employeeMessage.null} ${nextID}`);
      } else {
        employees.push(this.constructor.resolveEmployeeData(employee));
      }
    }, Promise.resolve());

    return employees;
  }

  static resolveEmployeeData(employee) {
    const { deletedAt, deletedBy, ...employeeData } = employee;

    return employeeData;
  }
}

module.exports = EmployeeUsecase;
