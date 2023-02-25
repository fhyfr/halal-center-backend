const Models = require('./models');
const logger = require('../helpers/logger');

class DepartmentRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.departmentModel = Models.Department;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const department = await this.cacheService.get(cacheKey);

      return JSON.parse(department);
    } catch (error) {
      const department = await this.departmentModel.findOne({
        where: { id },
        raw: true,
      });

      if (department === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(department));

      return department;
    }
  }

  async findByDepartmentName(departmentName) {
    const department = await this.departmentModel.findOne({
      where: {
        departmentName: {
          [Models.Sequelize.Op.iLike]: departmentName,
        },
      },
      attributes: ['id'],
      raw: true,
    });

    if (department === null) return null;
    return department;
  }

  async findAll(offset, limit, query) {
    if (query && query !== '') {
      const departmentIds = await this.departmentModel.findAndCountAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id'],
        where: {
          departmentName: {
            [Models.Sequelize.Op.iLike]: `%${query}%`,
          },
        },
        limit,
        offset,
        raw: true,
      });

      return {
        count: departmentIds.count,
        rows: departmentIds.rows.map(
          (departmentIds.rows, (department) => department.id),
        ),
      };
    }

    const departmentIds = await this.departmentModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: departmentIds.count,
      rows: departmentIds.rows.map(
        (departmentIds.rows, (department) => department.id),
      ),
    };
  }

  async create(department) {
    const result = await this.departmentModel.create(department);

    if (result === null) {
      logger.error('create department failed');
      throw new Error('create department failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async update(department) {
    const result = await this.departmentModel.update(department, {
      where: { id: department.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('update department failed');
    }

    const cacheKey = this.constructor.cacheKeyById(result[1][0].id);

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteById(id, userId) {
    const result = await this.departmentModel.destroy({ where: { id } });

    await this.departmentModel.update(
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
    return `department:${id}`;
  }
}

module.exports = DepartmentRepository;
