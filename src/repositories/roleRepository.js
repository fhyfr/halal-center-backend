const { nanoid } = require('nanoid');
const Models = require('./models');

class RoleRepository {
  constructor(cacheService) {
    this.roleModel = Models.Role;
    this.cacheService = cacheService;
  }

  async findByRoleId(roleId) {
    const cacheKey = this.constructor.cacheKeyByRoleId(roleId);

    try {
      const role = await this.cacheService.get(cacheKey);

      return JSON.parse(role);
    } catch (error) {
      const role = await this.roleModel.findOne({
        where: { roleId },
        raw: true,
      });

      if (role === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(role));
      return role;
    }
  }

  async findAll(offset, limit) {
    const roleIds = await this.roleModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['roleId'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: roleIds.count,
      rows: roleIds.rows.map((roleIds.rows, (role) => role.roleId)),
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

  async create(role) {
    const result = await this.roleModel.create({
      roleId: `role-${nanoid(16)}`,
      roleName: role.name,
      roleToken: role.token,
    });
    if (result === null) return null;

    const cacheKeyId = this.constructor.cacheKeyByRoleId(result.roleId);
    const cacheKeyRoleName = this.constructor.cacheKeyByRoleName(
      result.roleName,
    );

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    await this.cacheService.set(cacheKeyRoleName, result.roleId);

    return result;
  }

  static cacheKeyByRoleId(roleId) {
    return `role:${roleId}`;
  }

  static cacheKeyByRoleName(roleName) {
    return `role:name:${roleName}`;
  }
}

module.exports = RoleRepository;
