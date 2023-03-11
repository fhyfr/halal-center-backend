const { ForbiddenError } = require('@casl/ability');
const InvariantError = require('../exceptions/invariantError');
const NotFoundError = require('../exceptions/notFoundError');
const { getPagination, getPagingData } = require('../helpers/pagination');
const {
  user: userMessage,
  auth: authMessage,
  role: roleMessage,
  member: memberMessage,
  getPublicUserProperties,
} = require('../helpers/responseMessage');
const { validatePassword, encryptPassword } = require('../helpers/encryption');
const { sendEmail } = require('../email/sendEmail');
const { generateOTP } = require('../helpers/generator');
const logger = require('../helpers/logger');

const { ROOT_URL } = process.env;

class UserUsecase {
  constructor(userRepo, roleRepo, memberRepo) {
    this.userRepo = userRepo;
    this.roleRepo = roleRepo;
    this.memberRepo = memberRepo;
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'User');

    const { page, size, query, roleId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.userRepo.findAll(offset, limit, query, roleId);

    const resultRows = {
      count: ids.count,
      rows: await this.resolveUsers(ids.rows),
    };

    return getPagingData(resultRows, page, limit);
  }

  async findUserById(userId, ability) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'User');

    const user = await this.resolveUser(userId);
    if (user === null) return null;

    return user;
  }

  async findByEmail(email) {
    const user = await this.userRepo.findByEmail(email.toLowerCase());
    if (user === null) return null;

    return user;
  }

  async findByUsername(username) {
    const user = await this.userRepo.findByUsername(username);

    if (user === null) {
      throw new NotFoundError(userMessage.notFound);
    }

    return this.resolveUser(user.id);
  }

  async checkUsername(username) {
    const isUsernameExist = await this.userRepo.findByUsername(
      username.toLowerCase(),
    );

    return isUsernameExist !== null;
  }

  async checkEmail(email) {
    const isEmailExist = await this.userRepo.findByEmail(email.toLowerCase());

    return isEmailExist !== null;
  }

  async create(user) {
    return this.userRepo.create(user);
  }

  async forgotPassword(email) {
    const user = await this.userRepo.findByEmail(email);
    // if user not found just return
    // for security reason
    if (!user) {
      return;
    }

    const otp = generateOTP();

    await this.userRepo.forgotPassword(user.id, email, user.username, otp);

    sendEmail('forgot-password', email, {
      username: user.username,
      otp,
      action_url: `${ROOT_URL}/auth/forgot-password?email=${email}`,
    });

    return user;
  }

  async updateOTPVerificationStatus(userId, email, username) {
    return this.userRepo.updateVerificationStatus(userId, email, username);
  }

  async updateOTP(id, email, username, newOtp) {
    return this.userRepo.updateOTP(id, email, username, newOtp);
  }

  async resetPassword(userId, newPassword) {
    const existingUser = await this.userRepo.findById(userId);

    if (!existingUser) {
      return;
    }

    if (!existingUser.isOtpVerified) {
      throw new InvariantError(authMessage.verify.notVerified);
    }

    const encryptedPassword = await encryptPassword(newPassword);

    await this.userRepo.updatePassword(userId, encryptedPassword);

    return getPublicUserProperties(existingUser);
  }

  async resolveUsers(ids) {
    const users = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;

      if (nextID == null || nextID <= 0) {
        logger.error(`${userMessage.null} ${nextID}`);
      } else {
        users.push(await this.resolveUser(nextID));
      }
    }, Promise.resolve());

    return users;
  }

  async resolveUser(id) {
    const user = await this.userRepo.findById(id);

    if (user === null) return null;

    const role = await this.roleRepo.findById(user.roleId);
    if (role == null) return null;

    Object.assign(user, {
      role: {
        id: role.id,
        roleName: role.roleName,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    });

    let member;

    if (role.id === 3) {
      member = await this.memberRepo.findByUserId(user.id);
      if (!member || member === null) {
        logger.warn(memberMessage.notFound);
      }
    }

    return getPublicUserProperties(user, member);
  }

  async updatePassword(ability, body, userId) {
    const existingUser = await this.userRepo.findById(userId);

    ForbiddenError.from(ability).throwUnlessCan('update', 'User');

    const isPasswordValid = await validatePassword(
      body.password,
      existingUser.password,
    );

    if (!isPasswordValid)
      throw new InvariantError(userMessage.password.invalid);

    const newPassword = await encryptPassword(body.newPassword);

    await this.userRepo.updatePassword(userId, newPassword);

    return getPublicUserProperties(existingUser);
  }

  async deleteById(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'User');

    const existingUser = await this.userRepo.findById(id);
    if (!existingUser || existingUser === null) {
      throw new NotFoundError(userMessage.notFound);
    }

    return this.userRepo.deleteById(
      id,
      existingUser.username,
      existingUser.email,
      userId,
    );
  }

  async findCurrentUser(req) {
    const { id: userId } = req.user;

    const user = await this.resolveUser(userId);
    if (user === null) return null;

    return user;
  }

  async createNewUser(ability, body) {
    ForbiddenError.from(ability).throwUnlessCan('create', 'User');

    const existingRole = await this.roleRepo.findById(body.roleId);
    if (!existingRole || existingRole === null) {
      throw new NotFoundError(roleMessage.notFound);
    }

    const isUsernameExist = await this.checkUsername(body.username);
    if (isUsernameExist) {
      throw new InvariantError(authMessage.register.usernameExist);
    }

    const isEmailExist = await this.checkEmail(body.email);
    if (isEmailExist) {
      throw new InvariantError(authMessage.register.emailExist);
    }

    const encryptedPassword = body.password
      ? await encryptPassword(body.password)
      : null;

    const newUser = {
      roleId: body.roleId,
      email: body.email.toLowerCase(),
      password: encryptedPassword,
      username: body.username.toLowerCase(),
      isOtpVerified: true,
    };

    const result = await this.userRepo.create(newUser);

    return getPublicUserProperties(result);
  }

  async updateUser(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'User');

    const existingUser = await this.userRepo.findById(req.params.id);
    if (!existingUser || existingUser === null) {
      throw new NotFoundError(userMessage.notFound);
    }

    const { id: userId } = req.user;
    const { body } = req;

    if (body.roleId) {
      const existingRole = await this.roleRepo.findById(body.roleId);
      if (!existingRole || existingRole === null) {
        throw new NotFoundError(roleMessage.notFound);
      }
    }

    if (body.username) {
      const isUsernameExist = await this.checkUsername(body.username);
      if (
        isUsernameExist &&
        body.username.toLowerCase() !== existingUser.username
      ) {
        throw new InvariantError(authMessage.register.usernameExist);
      }
    }

    if (body.email) {
      const isEmailExist = await this.checkEmail(body.email);
      if (isEmailExist && body.email.toLowerCase() !== existingUser.email) {
        throw new InvariantError(authMessage.register.emailExist);
      }
    }

    Object.assign(body, { updatedBy: userId });

    const result = await this.userRepo.update(req.params.id, body);

    return getPublicUserProperties(result);
  }
}

module.exports = UserUsecase;
