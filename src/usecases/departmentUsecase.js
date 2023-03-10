const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const { department: departmentMessage } = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class DepartmentUsecase {
  constructor(departmentRepo, employeeRepo) {
    this.departmentRepo = departmentRepo;
    this.employeeRepo = employeeRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Department');

    const department = await this.departmentRepo.findById(id);

    if (department === null) {
      throw new NotFoundError(departmentMessage.notFound);
    }

    return this.resolveDepartmentData(department);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Department');

    const { page, size, query } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.departmentRepo.findAll(offset, limit, query);

    const dataRows = {
      count: ids.count,
      rows: await this.resolveDepartments(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async isDepartmentNameExist(departmentName) {
    const existingDepartment = await this.departmentRepo.findByDepartmentName(
      departmentName.toLowerCase(),
    );

    return existingDepartment !== null;
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Department');

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const checkDepartmentName = await this.isDepartmentNameExist(
      req.body.departmentName,
    );
    if (checkDepartmentName) {
      throw new InvariantError(departmentMessage.exist);
    }

    const result = await this.departmentRepo.create(req.body);

    return this.resolveDepartmentData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Department');

    const existingDepartment = await this.departmentRepo.findById(
      req.params.id,
    );
    if (!existingDepartment) {
      throw new NotFoundError(departmentMessage.notFound);
    }

    const isDepartmentNameExist =
      await this.departmentRepo.findByDepartmentName(
        req.body.departmentName.toLowerCase(),
      );

    if (isDepartmentNameExist) {
      if (isDepartmentNameExist.id.toString() !== req.params.id.toString()) {
        throw new InvariantError(departmentMessage.exist);
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    const result = await this.departmentRepo.update(req.body);

    return this.resolveDepartmentData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Department');

    const department = await this.departmentRepo.findById(id);
    if (department === null) {
      throw new NotFoundError(departmentMessage.notFound);
    }

    const totalEmployees = await this.employeeRepo.countByDepartmentId(id);
    if (totalEmployees > 0) {
      throw new InvariantError(departmentMessage.notEmpty);
    }

    return this.departmentRepo.deleteById(id, userId);
  }

  async resolveDepartments(ids) {
    const departments = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const department = await this.departmentRepo.findById(nextID);

      if (department == null) {
        logger.error(`${departmentMessage.null} ${nextID}`);
      } else {
        departments.push(await this.resolveDepartmentData(department));
      }
    }, Promise.resolve());

    return departments;
  }

  async resolveDepartmentData(department) {
    const totalEmployees = await this.employeeRepo.countByDepartmentId(
      department.id,
    );
    Object.assign(department, { totalEmployees });

    const { deletedAt, deletedBy, ...departmentData } = department;
    return departmentData;
  }
}

module.exports = DepartmentUsecase;
