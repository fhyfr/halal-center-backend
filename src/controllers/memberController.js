const { member: memberMessage } = require('../helpers/responseMessage');

class MemberController {
  constructor(memberUsecase, validator) {
    this.memberUsecase = memberUsecase;
    this.validator = validator;

    this.findAll = this.findAll.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllMembersPayload(req.query);

      const members = await this.memberUsecase.findAll(req);

      return res.respond(members);
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(req, res, next) {
    const { id: userId } = req.user;

    try {
      this.validator.validateUpdateProfilePayload(req.body);

      const result = await this.memberUsecase.updateProfile(
        req.ability,
        userId,
        req.body,
      );

      return res.respond({
        message: memberMessage.update,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = MemberController;
