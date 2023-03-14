const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  employee: employeeMessage,
  position: positionMessage,
  department: departmentMessage,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class EmployeeUsecase {
  constructor(employeeRepo, positionRepo, departmentRepo) {
    this.employeeRepo = employeeRepo;
    this.positionRepo = positionRepo;
    this.departmentRepo = departmentRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Employee');

    const employee = await this.employeeRepo.findById(id);

    if (employee === null) {
      throw new NotFoundError(employeeMessage.notFound);
    }

    return this.resolveEmployeeData(employee);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Employee');

    const { page, size, query, departmentId, positionId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.employeeRepo.findAll(
      offset,
      limit,
      query,
      departmentId,
      positionId,
    );

    const dataRows = {
      count: ids.count,
      rows: await this.resolveEmployees(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async isEmployeeNIKExist(nik) {
    const existingEmployee = await this.employeeRepo.findByNIK(nik);

    return existingEmployee !== null;
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Employee');

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const checkEmployeeNIK = await this.isEmployeeNIKExist(req.body.nik);
    if (checkEmployeeNIK) {
      throw new InvariantError(`${employeeMessage.nikExist} ${req.body.nik}`);
    }

    const isPositionExist = await this.positionRepo.findById(
      req.body.positionId,
    );
    if (!isPositionExist) {
      throw new InvariantError(positionMessage.notFound);
    }

    const isDepartmentExist = await this.departmentRepo.findById(
      req.body.departmentId,
    );
    if (!isDepartmentExist) {
      throw new InvariantError(departmentMessage.notFound);
    }

    const result = await this.employeeRepo.create(req.body);

    return this.resolveEmployeeData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Employee');

    const existingEmployee = await this.employeeRepo.findById(req.params.id);
    if (!existingEmployee) {
      throw new NotFoundError(employeeMessage.notFound);
    }

    if (req.body.nik) {
      const isNIKExist = await this.employeeRepo.findByNIK(req.body.nik);
      if (isNIKExist && existingEmployee.nik !== req.body.nik) {
        throw new InvariantError(`${employeeMessage.nikExist} ${req.body.nik}`);
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    const result = await this.employeeRepo.update(req.body);

    return this.resolveEmployeeData(result);
  }

  async mutation(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Employee');

    const existingEmployee = await this.employeeRepo.findById(req.params.id);
    if (!existingEmployee) {
      throw new NotFoundError(employeeMessage.notFound);
    }

    const isPositionExist = await this.positionRepo.findById(
      req.body.positionId,
    );
    if (!isPositionExist) {
      throw new InvariantError(positionMessage.notFound);
    }

    const isDepartmentExist = await this.departmentRepo.findById(
      req.body.departmentId,
    );
    if (!isDepartmentExist) {
      throw new InvariantError(departmentMessage.notFound);
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    const result = await this.employeeRepo.update(req.body);

    return this.resolveEmployeeData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Employee');

    const employee = await this.employeeRepo.findById(id);
    if (employee === null) {
      throw new NotFoundError(employeeMessage.notFound);
    }

    return this.employeeRepo.deleteById(id, userId, employee.nik);
  }

  async resolveEmployees(ids) {
    const employees = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const employee = await this.employeeRepo.findById(nextID);

      if (employee == null) {
        logger.error(`${employeeMessage.null} ${nextID}`);
      } else {
        employees.push(await this.resolveEmployeeData(employee));
      }
    }, Promise.resolve());

    return employees;
  }

  async resolveEmployeeData(employee) {
    const { deletedAt, deletedBy, ...employeeData } = employee;

    const employeePosition = await this.positionRepo.findById(
      employeeData.positionId,
    );

    const employeeDepartment = await this.departmentRepo.findById(
      employeeData.departmentId,
    );

    if (employeePosition !== null && employeeDepartment !== null) {
      delete employeePosition.deletedBy;
      delete employeePosition.deletedAt;
      delete employeeDepartment.deletedBy;
      delete employeeDepartment.deletedAt;

      Object.assign(employeeData, {
        position: employeePosition,
        department: employeeDepartment,
      });
    }

    return employeeData;
  }
}

module.exports = EmployeeUsecase;
