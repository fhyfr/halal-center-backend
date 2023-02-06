/* eslint-disable import/no-extraneous-dependencies */
const bcrypt = require('bcrypt');
const { ForbiddenError } = require('@casl/ability');
const InvariantError = require('../exceptions/invariantError');
const NotFoundError = require('../exceptions/notFoundError');
const { role: roleMessage } = require('../helpers/responseMessage');

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

    return this.roleRepo.create(newRole);
  }

  async findByRoleName(roleName) {
    const result = await this.roleRepo.findByRoleName(roleName);

    if (result === null) throw new InvariantError(roleMessage.notFound);
    return result;
  }

  async findAll(ability) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Role');

    return this.roleRepo.findAll();
  }

  async findById(id) {
    const result = await this.roleRepo.findById(id);

    if (result === null) throw new NotFoundError(roleMessage.notFound);
    return result;
  }
}

module.exports = RoleUsecase;
