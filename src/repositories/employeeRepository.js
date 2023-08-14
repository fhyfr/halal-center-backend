const { nanoid } = require('nanoid');
const Models = require('./models');
const logger = require('../helpers/logger');

class EmployeeRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.employeeModel = Models.Employee;
  }

  async findByEmployeeId(employeeId) {
    const cacheKey = this.constructor.cacheKeyByEmployeeId(employeeId);

    try {
      const employee = await this.cacheService.get(cacheKey);

      return JSON.parse(employee);
    } catch (error) {
      const employee = await this.employeeModel.findOne({
        where: { employeeId },
        raw: true,
      });

      if (employee === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(employee));

      return employee;
    }
  }

  async findByNIK(nik) {
    const cacheKey = this.constructor.cacheKeyByNIK(nik);

    try {
      const employee = await this.cacheService.get(cacheKey);

      return JSON.parse(employee);
    } catch (error) {
      const employee = await this.employeeModel.findOne({
        where: {
          nik,
        },
        raw: true,
      });

      if (employee === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(employee));
      return employee;
    }
  }

  async countByDepartmentId(departmentId) {
    return this.employeeModel.count({ where: { departmentId } });
  }

  async countByPositionId(positionId) {
    return this.employeeModel.count({ where: { positionId } });
  }

  async findAll(offset, limit, query, departmentId, positionId) {
    const whereConditions = {};

    if (query && query !== '') {
      Object.assign(whereConditions, {
        fullName: {
          [Models.Sequelize.Op.iLike]: `%${query}%`,
        },
      });
    }

    if (departmentId && departmentId > 0) {
      Object.assign(whereConditions, {
        departmentId,
      });
    }

    if (positionId && positionId > 0) {
      Object.assign(whereConditions, {
        positionId,
      });
    }

    const employeeIds = await this.employeeModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['employeeId'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    return {
      count: employeeIds.count,
      rows: employeeIds.rows.map(
        (employeeIds.rows, (employee) => employee.employeeId),
      ),
    };
  }

  async create(employee) {
    Object.assign(employee, {
      employeeId: `employee-${nanoid(16)}`,
    });

    const result = await this.employeeModel.create(employee);

    if (result === null) {
      logger.error('create employee failed');
      throw new Error('create employee failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByEmployeeId(result.employeeId);
    const cacheKeyNIK = this.constructor.cacheKeyByNIK(result.nik);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    await this.cacheService.set(cacheKeyNIK, JSON.stringify(result));

    return result.dataValues;
  }

  async update(employee) {
    const result = await this.employeeModel.update(employee, {
      where: { employeeId: employee.employeeId },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('update employee failed');
    }

    const cacheKeys = [
      this.constructor.cacheKeyByEmployeeId(result[1][0].employeeId),
      this.constructor.cacheKeyByNIK(result[1][0].nik),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async deleteByEmployeeId(employeeId, userId, nik) {
    const result = await this.employeeModel.destroy({ where: { employeeId } });

    await this.employeeModel.update(
      { deletedBy: userId },
      {
        where: { employeeId },
        paranoid: false,
      },
    );

    const cacheKeys = [
      this.constructor.cacheKeyByEmployeeId(employeeId),
      this.constructor.cacheKeyByNIK(nik),
    ];
    await this.cacheService.delete(cacheKeys);

    return result;
  }

  static cacheKeyByEmployeeId(employeeId) {
    return `employee:${employeeId}`;
  }

  static cacheKeyByNIK(nik) {
    return `employee:${nik}`;
  }
}

module.exports = EmployeeRepository;
