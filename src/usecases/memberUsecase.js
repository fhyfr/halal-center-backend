const { ForbiddenError, subject } = require('@casl/ability');
const InvariantError = require('../exceptions/invariantError');
const {
  auth: authMessage,
  member: memberMessage,
  getPublicUserProperties,
} = require('../helpers/responseMessage');

class MemberUsecase {
  constructor(memberRepo, userRepo) {
    this.memberRepo = memberRepo;
    this.userRepo = userRepo;
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
}

module.exports = MemberUsecase;
