const { nanoid } = require('nanoid');
const Models = require('./models');
const logger = require('../helpers/logger');

class DepartmentRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.departmentModel = Models.Department;
  }

  async findByDepartmentId(departmentId) {
    const cacheKey = this.constructor.cacheKeyByDepartmentId(departmentId);

    try {
      const department = await this.cacheService.get(cacheKey);

      return JSON.parse(department);
    } catch (error) {
      const department = await this.departmentModel.findOne({
        where: { departmentId },
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
      attributes: ['departmentId'],
      raw: true,
    });

    if (department === null) return null;
    return department;
  }

  async findAll(offset, limit, query) {
    if (query && query !== '') {
      const departmentIds = await this.departmentModel.findAndCountAll({
        order: [['createdAt', 'DESC']],
        attributes: ['departmentId'],
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
          (departmentIds.rows, (department) => department.departmentId),
        ),
      };
    }

    const departmentIds = await this.departmentModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['departmentId'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: departmentIds.count,
      rows: departmentIds.rows.map(
        (departmentIds.rows, (department) => department.departmentId),
      ),
    };
  }

  async create(department) {
    Object.assign(department, {
      departmentId: `department-${nanoid(16)}`,
    });

    const result = await this.departmentModel.create(department);

    if (result === null) {
      logger.error('create department failed');
      throw new Error('create department failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByDepartmentId(
      result.departmentId,
    );

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async update(department) {
    const result = await this.departmentModel.update(department, {
      where: { departmentId: department.departmentId },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('update department failed');
    }

    const cacheKey = this.constructor.cacheKeyByDepartmentId(
      result[1][0].departmentId,
    );

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteByDepartmentId(departmentId, userId) {
    const result = await this.departmentModel.destroy({
      where: { departmentId },
    });

    await this.departmentModel.update(
      { deletedBy: userId },
      {
        where: { departmentId },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyByDepartmentId(departmentId);
    await this.cacheService.delete(cacheKey);

    return result;
  }

  static cacheKeyByDepartmentId(departmentId) {
    return `department:${departmentId}`;
  }
}

module.exports = DepartmentRepository;
