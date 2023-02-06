/* eslint-disable import/no-extraneous-dependencies */
const { subject, ForbiddenError } = require('@casl/ability');
const InvariantError = require('../exceptions/invariantError');
const NotFoundError = require('../exceptions/notFoundError');
const constant = require('../helpers/constant');
const { getPagination, getPagingData } = require('../helpers/pagination');
const {
  user: userMessage,
  auth: authMessage,
  role: roleMessage,
} = require('../helpers/responseMessage');
const { validatePassword, encryptPassword } = require('../helpers/encryption');
const { sendEmail } = require('../email/sendMail');

class UserUsecase {
  constructor(userRepo, roleRepo, memberRepo) {
    this.userRepo = userRepo;
    this.roleRepo = roleRepo;
    this.memberRepo = memberRepo;
  }

  async findAll(req) {
    const { page, size, query, roleId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.userRepo.search(offset, limit, query, roleId);

    const resultRows = {
      count: ids.count,
      rows: await this.resolveUsers(ids.rows),
    };

    return getPagingData(resultRows, page, limit);
  }

  async findUserById(id) {
    const user = await this.resolveUser(id);
    if (user === null) {
      throw new NotFoundError(userMessage.notFound);
    }

    return user;
  }

  async findByEmail(email) {
    const user = await this.userRepo.findByEmail(email);
    if (user === null) {
      throw new NotFoundError(userMessage.notFound);
    }

    return user;
  }

  async findByUsername(username) {
    const user = await this.userRepo.findByUsername(username);

    if (user === null) {
      throw new NotFoundError(userMessage.notFound);
    }

    return this.resolveUser(user.id);
  }

  async create(user) {
    return this.userRepo.create(user);
  }

  async forgotPassword(body) {
    const { registerType } = constant.auth;
    const user = await this.userRepo.findByEmail(body.email);
    if (!user || user.isRegisterUsing !== registerType.STANDARD) return null;

    const result = await this.userRepo.forgotPassword(user.id, body.email);

    sendEmail('forgotpassword', body.email, {
      username: result.username,
    });
  }

  async updateUser(ability, id, body) {
    const { email, username } = body;
    await this.userRepo.findById(id).then(async (user) => {
      ForbiddenError.from(ability).throwUnlessCan(
        'update',
        subject('User', user),
      );

      if (!user) {
        throw new NotFoundError(userMessage.notFound);
      }

      const updateData = {
        username,
      };

      if (email && email !== '') {
        if (user.email !== email) {
          const isEmailExist = await this.userRepo.findByEmail(email);
          if (isEmailExist) {
            throw new InvariantError(authMessage.register.emailExist);
          }

          await this.userRepo.update(id, updateData);
        } else {
          await this.userRepo.update(id, username);
        }
      } else {
        await this.userRepo.update(id, updateData);
      }
    });

    return this.resolveUser(id);
  }

  async confirmToChangeEmail(ability, id, body) {
    const { newEmail } = body;

    const isEmailExist = await this.userRepo.findByEmail(newEmail);
    if (isEmailExist) {
      throw new InvariantError(authMessage.register.emailExist);
    }

    const user = await this.userRepo.findById(id);

    if (user === null) return null;

    ForbiddenError.from(ability).throwUnlessCan(
      'update',
      subject('User', user),
    );

    await this.userRepo.update(id, {
      email: newEmail,
    });

    return this.resolveUser(id);
  }

  async resolveUsers(ids) {
    const users = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      return this.resolveUser(nextID).then((user) => {
        if (user != null) {
          users.push(user);
        }
      });
    }, Promise.resolve());

    return users;
  }

  async resolveUser(id) {
    const user = await this.userRepo.findById(id);

    if (user === null) return null;

    const role = await this.roleRepo.findById(user.roleId);
    if (role == null) return null;

    Object.assign(user, {
      role,
    });
    const { password, ...publicData } = user;

    return publicData;
  }

  async updatePassword(ability, body, userId) {
    const existingUser = await this.findUserById(userId);

    ForbiddenError.from(ability).throwUnlessCan(
      'update',
      subject('User', existingUser),
    );

    const isPasswordValid = await validatePassword(
      body.password,
      existingUser.password,
    );

    if (!isPasswordValid)
      throw new InvariantError(userMessage.password.invalid);

    const newPassword = await encryptPassword(body.newPassword);

    const updatedUser = await this.userRepo.updatePassword(userId, newPassword);

    const { id } = updatedUser[1][0];

    return { id };
  }

  async updateUserRole(ability, body) {
    ForbiddenError.from(ability).throwUnlessCan(
      'update',
      subject('User', { id: null }),
    );

    const { userId, roleId } = body;

    await this.findUserById(userId);

    const role = await this.roleRepo.findById(roleId);
    if (role === null) {
      throw new NotFoundError(roleMessage.notFound);
    }

    const updatedUser = await this.userRepo.updateRole(userId, roleId);
    const { password, ...publicData } = updatedUser[1][0];

    return publicData;
  }

  async deleteById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'User');
    await this.findUserById(id);
    return this.userRepo.deleteById(id);
  }

  async findCurrentUser(req) {
    const { id: userId } = req.user;

    return this.findUserById(userId);
  }
}

module.exports = UserUsecase;
