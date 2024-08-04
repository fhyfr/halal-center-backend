const Models = require('./models');

class RegistrationRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.registrationModel = Models.Registration;
  }

  async findByRegistrationId(id) {
    const cacheKey = this.constructor.cacheKeyByRegistrationId(id);

    try {
      const registration = await this.cacheService.get(cacheKey);

      return JSON.parse(registration);
    } catch (error) {
      const registration = await this.registrationModel.findOne({
        where: { id },
        raw: true,
      });
      if (registration === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(registration));
      return registration;
    }
  }

  async findByUserId(userId) {
    const cacheKey = this.constructor.cacheKeyByUserId(userId);

    try {
      const registration = await this.cacheService.get(cacheKey);

      return JSON.parse(registration);
    } catch (error) {
      const registration = await this.registrationModel.findOne({
        where: { userId },
        raw: true,
      });

      if (registration === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(registration));
      return registration;
    }
  }

  async findByCourseIdAndUserId(courseId, userId) {
    const cacheKey = this.constructor.cacheKeyByCourseIdAndUserId(
      courseId,
      userId,
    );

    try {
      const registration = await this.cacheService.get(cacheKey);

      return JSON.parse(registration);
    } catch (error) {
      const registration = await this.registrationModel.findOne({
        where: { courseId, userId },
        raw: true,
      });
      if (registration === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(registration));
      return registration;
    }
  }

  async findParticipantsByCourseId(courseId) {
    const cacheKey = this.constructor.cacheKeyByCourseId(courseId);

    try {
      const participants = await this.cacheService.get(cacheKey);

      return JSON.parse(participants);
    } catch (error) {
      const participants = await this.registrationModel.findAll({
        where: { courseId },
        raw: true,
      });
      if (participants === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(participants));
      return participants;
    }
  }

  static cacheKeyByRegistrationId(id) {
    return `registration:${id}`;
  }

  static cacheKeyByUserId(userId) {
    return `registration:userId:${userId}`;
  }

  static cacheKeyByCourseIdAndUserId(courseId, userId) {
    return `registration:courseId:${courseId}:userId:${userId}`;
  }

  static cacheKeyByCourseId(courseId) {
    return `registration:courseId:${courseId}`;
  }
}

module.exports = RegistrationRepository;
