const { ForbiddenError, subject } = require('@casl/ability');
const InvariantError = require('../exceptions/invariantError');
const {
  auth: authMessage,
  member: memberMessage,
  getPublicUserProperties,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');

class MemberUsecase {
  constructor(memberRepo, userRepo, provinceRepo, cityRepo) {
    this.memberRepo = memberRepo;
    this.userRepo = userRepo;
    this.provinceRepo = provinceRepo;
    this.cityRepo = cityRepo;
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Member');

    const { page, size, courseId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.memberRepo.findAll(offset, limit, courseId);

    const dataRows = {
      count: ids.count,
      rows: await this.resolveMembers(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(userId, fullName) {
    return this.memberRepo.create(userId, fullName);
  }

  async updateProfile(ability, userId, member) {
    if (Object.keys(member).length === 0) {
      throw new InvariantError(memberMessage.bodyEmpty);
    }

    const existingUser = await this.userRepo.findById(userId);

    ForbiddenError.from(ability).throwUnlessCan(
      'update',
      subject('Member', existingUser),
    );

    let updatedUser = { ...existingUser };

    if (member.username) {
      const existingUsername = await this.userRepo.findByUsername(
        member.username.toLowerCase(),
      );

      if (existingUsername) {
        if (
          existingUsername.username.toLowerCase() ===
            member.username.toLowerCase() &&
          existingUsername.id !== userId
        ) {
          throw new InvariantError(authMessage.register.usernameExist);
        }
      }

      updatedUser = await this.userRepo.update(userId, {
        username: member.username.toLowerCase(),
      });
    }

    const newMember = { ...member };
    delete newMember.username;

    const resultMember = await this.memberRepo.updateByUserId(
      userId,
      newMember,
    );

    return getPublicUserProperties(updatedUser, resultMember);
  }

  async resolveMembers(ids) {
    const members = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const member = await this.memberRepo.findByUserId(nextID);

      if (member == null) {
        logger.error(`${memberMessage.null} ${nextID}`);
      } else {
        members.push(await this.resolveMemberData(member));
      }
    }, Promise.resolve());

    return members;
  }

  async resolveMemberData(member) {
    const user = await this.userRepo.findById(member.userId);
    const province = await this.provinceRepo.findByProvinceId(
      member.provinceId,
    );
    const city = await this.cityRepo.findByCityId(member.cityId);

    return getPublicUserProperties(user, member, null, province, city);
  }
}

module.exports = MemberUsecase;
