const bcrypt = require('bcrypt');
const { ForbiddenError } = require('@casl/ability');
const InvariantError = require('../exceptions/invariantError');
const NotFoundError = require('../exceptions/notFoundError');
const { role: roleMessage } = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');

class RoleUsecase {
  constructor(roleRepo) {
    this.roleRepo = roleRepo;
  }

  async create(ability, body) {
    ForbiddenError.from(ability).throwUnlessCan('create', 'Role');

    const existingRole = await this.roleRepo.findByRoleName(body.roleName);

    if (existingRole) throw new InvariantError(roleMessage.exist);

    const salt = await bcrypt.genSalt();
    const roleToken = await bcrypt.hash(body.roleName, salt);

    const newRole = {
      name: body.roleName,
      token: roleToken,
    };

    const result = await this.roleRepo.create(newRole);

    return this.constructor.resolveRole(result);
  }

  async findByRoleName(roleName) {
    const result = await this.roleRepo.findByRoleName(roleName);

    if (result === null) throw new NotFoundError(roleMessage.notFound);
    return this.constructor.resolveRole(result);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Role');

    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.roleRepo.findAll(offset, limit);

    const resultRows = {
      count: ids.count,
      rows: await this.resolveRoles(ids.rows),
    };

    return getPagingData(resultRows, page, limit);
  }

  async findById(id) {
    const result = await this.roleRepo.findById(id);

    if (result === null) throw new NotFoundError(roleMessage.notFound);
    return result;
  }

  async resolveRoles(ids) {
    const roles = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;

      const role = await this.roleRepo.findById(nextID);

      if (role == null) {
        logger.error(`${roleMessage.null} ${nextID}`);
      } else {
        roles.push(await this.constructor.resolveRole(role));
      }
    }, Promise.resolve());

    return roles;
  }

  static resolveRole(role) {
    const { roleToken, ...roleData } = role;
    return roleData;
  }
}

module.exports = RoleUsecase;
