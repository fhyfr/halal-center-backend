const { ForbiddenError } = require('@casl/ability');
const InvariantError = require('../exceptions/invariantError');
const NotFoundError = require('../exceptions/notFoundError');
const { getPagination, getPagingData } = require('../helpers/pagination');
const {
  user: userMessage,
  auth: authMessage,
  role: roleMessage,
  member: memberMessage,
  instructor: instructorMessage,
  getPublicUserProperties,
} = require('../helpers/responseMessage');
const { validatePassword, encryptPassword } = require('../helpers/encryption');
const { sendEmail } = require('../email/sendEmail');
const { generateOTP } = require('../helpers/generator');
const logger = require('../helpers/logger');
const { role: roleConstant } = require('../helpers/constant');

const { ROOT_URL } = process.env;

class UserUsecase {
  constructor(userRepo, roleRepo, memberRepo, instructorRepo) {
    this.userRepo = userRepo;
    this.roleRepo = roleRepo;
    this.memberRepo = memberRepo;
    this.instructorRepo = instructorRepo;
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
    if (user === null) {
      throw new NotFoundError(userMessage.notFound);
    }

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

    return this.resolveUser(user.userId);
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

    await this.userRepo.forgotPassword(user.userId, email, user.username, otp);

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

  async updateOTP(userId, email, username, newOtp) {
    return this.userRepo.updateOTP(userId, email, username, newOtp);
  }

  async resetPassword(userId, newPassword) {
    const existingUser = await this.userRepo.findByUserId(userId);

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

  async resetPasswordByAdmin(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('reset-password', 'User');

    const existingUser = await this.userRepo.findByUserId(req.params.userId);
    if (!existingUser) {
      throw new NotFoundError(userMessage.notFound);
    }

    const encryptedPassword = await encryptPassword(req.body.newPassword);

    await this.userRepo.updatePasswordByAdmin(
      req.params.userId,
      req.user.userId,
      encryptedPassword,
    );

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

  async resolveUser(userId) {
    const user = await this.userRepo.findByUserId(userId);
    if (user === null) return null;

    const role = await this.roleRepo.findByRoleId(user.roleId);
    if (role == null) return null;

    Object.assign(user, {
      role: {
        roleId: role.roleId,
        roleName: role.roleName,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    });

    let member;
    let instructor;

    switch (role.roleName) {
      case roleConstant.MEMBER.VALUE:
        member = await this.memberRepo.findByUserId(user.userId);
        if (!member || member === null) {
          logger.warn(memberMessage.notFound);
        }
        break;
      case roleConstant.INSTRUCTOR.VALUE:
        instructor = await this.instructorRepo.findByUserId(user.userId);
        if (!instructor || instructor === null) {
          logger.warn(instructorMessage.notFound);
        }
        break;
      default:
        break;
    }

    return getPublicUserProperties(user, member, instructor);
  }

  async updatePassword(ability, body, userId) {
    const existingUser = await this.userRepo.findByUserId(userId);

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

  async deleteByUserId(ability, userId, updaterId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'User');

    const existingUser = await this.userRepo.findByUserId(userId);
    if (!existingUser || existingUser === null) {
      throw new NotFoundError(userMessage.notFound);
    }

    return this.userRepo.deleteByUserId(
      userId,
      existingUser.username,
      existingUser.email,
      updaterId,
    );
  }

  async findCurrentUser(req) {
    const { userId } = req.user;

    const user = await this.resolveUser(userId);
    if (user === null) return null;

    return user;
  }

  async createNewUser(ability, body) {
    ForbiddenError.from(ability).throwUnlessCan('create', 'User');

    const existingRole = await this.roleRepo.findByRoleId(body.roleId);
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

    const existingUser = await this.userRepo.findByUserId(req.params.userId);
    if (!existingUser || existingUser === null) {
      throw new NotFoundError(userMessage.notFound);
    }

    const { userId } = req.user;
    const { body } = req;

    if (body.roleId) {
      const existingRole = await this.roleRepo.findByRoleId(body.roleId);
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

    const result = await this.userRepo.update(req.params.userId, body);

    return getPublicUserProperties(result);
  }
}

module.exports = UserUsecase;
