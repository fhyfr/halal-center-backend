const Models = require('./models');
const logger = require('../helpers/logger');

class EmployeeRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.employeeModel = Models.Employee;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const employee = await this.cacheService.get(cacheKey);

      return JSON.parse(employee);
    } catch (error) {
      const employee = await this.employeeModel.findOne({
        where: { id },
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

  async findAll(offset, limit, query) {
    if (query && query !== '') {
      const employeeIds = await this.employeeModel.findAndCountAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id'],
        where: {
          employeeName: {
            [Models.Sequelize.Op.iLike]: `%${query}%`,
          },
        },
        limit,
        offset,
        raw: true,
      });

      return {
        count: employeeIds.count,
        rows: employeeIds.rows.map(
          (employeeIds.rows, (employee) => employee.id),
        ),
      };
    }

    const employeeIds = await this.employeeModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: employeeIds.count,
      rows: employeeIds.rows.map((employeeIds.rows, (employee) => employee.id)),
    };
  }

  async create(employee) {
    const result = await this.employeeModel.create(employee);

    if (result === null) {
      logger.error('create employee failed');
      throw new Error('create employee failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);
    const cacheKeyNIK = this.constructor.cacheKeyByNIK(result.nik);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    await this.cacheService.set(cacheKeyNIK, JSON.stringify(result));

    return result.dataValues;
  }

  async update(employee) {
    const result = await this.employeeModel.update(employee, {
      where: { id: employee.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('update employee failed');
    }

    const cacheKeys = [
      this.constructor.cacheKeyById(result[1][0].id),
      this.constructor.cacheKeyByNIK(result[1][0].nik),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async deleteById(id, userId, nik) {
    const result = await this.employeeModel.destroy({ where: { id } });

    await this.employeeModel.update(
      { deletedBy: userId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKeys = [
      this.constructor.cacheKeyById(id),
      this.constructor.cacheKeyByNIK(nik),
    ];
    await this.cacheService.delete(cacheKeys);

    return result;
  }

  static cacheKeyById(id) {
    return `employee:${id}`;
  }

  static cacheKeyByNIK(nik) {
    return `employee:${nik}`;
  }
}

module.exports = EmployeeRepository;
