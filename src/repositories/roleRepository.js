const Models = require('./models');

class RoleRepository {
  constructor(cacheService) {
    this.roleModel = Models.Role;
    this.cacheService = cacheService;
  }

  async findAll(offset, limit) {
    const roleIds = await this.roleModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: roleIds.count,
      rows: roleIds.rows.map((roleIds.rows, (role) => role.id)),
    };
  }

  async findByRoleName(roleName) {
    const cacheKey = this.constructor.cacheKeyByRoleName(roleName);

    try {
      const role = await this.cacheService.get(cacheKey);

      return JSON.parse(role);
    } catch (error) {
      const role = await this.roleModel.findOne({
        where: { roleName },
        raw: true,
      });

      if (role === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(role));
      return role;
    }
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const role = await this.cacheService.get(cacheKey);

      return JSON.parse(role);
    } catch (error) {
      const role = await this.roleModel.findOne({
        where: { id },
        raw: true,
      });

      if (role === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(role));
      return role;
    }
  }

  async create(role) {
    const result = await this.roleModel.create({
      roleName: role.name,
      roleToken: role.token,
    });

    if (result === null) return null;

    const cacheKeyId = this.constructor.cacheKeyById(result.id);
    const cacheKeyRoleName = this.constructor.cacheKeyByRoleName(
      result.roleName,
    );

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    await this.cacheService.set(cacheKeyRoleName, result.id);

    return result;
  }

  static cacheKeyById(id) {
    return `role:${id}`;
  }

  static cacheKeyByRoleName(roleName) {
    return `role:name:${roleName}`;
  }
}

module.exports = RoleRepository;
