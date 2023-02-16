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

  async findByEmployeeName(employeeName) {
    const employee = await this.employeeModel.findOne({
      where: {
        employeeName: {
          [Models.Sequelize.Op.iLike]: employeeName,
        },
      },
      attributes: ['id'],
      raw: true,
    });

    if (employee === null) return null;
    return employee;
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

    if (result == null) {
      logger.error('create employee failed');
      throw new Error('create employee failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));

    return result.dataValues;
  }

  async update(employee) {
    const result = await this.employeeModel.update(employee, {
      where: { id: employee.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('failed update employee');
    }

    const cacheKey = this.constructor.cacheKeyById(result[1][0].id);

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteById(id, userId) {
    const result = await this.employeeModel.destroy({ where: { id } });

    await this.employeeModel.update(
      { deletedBy: userId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyById(id);
    await this.cacheService.delete(cacheKey);

    return result;
  }

  static cacheKeyById(id) {
    return `employee:${id}`;
  }
}

module.exports = EmployeeRepository;
