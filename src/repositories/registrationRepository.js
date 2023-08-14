const Models = require('./models');

class RegistrationRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.registrationModel = Models.Registration;
  }

  async findByRegistrationId(registrationId) {
    const cacheKey = this.constructor.cacheKeyByRegistrationId(registrationId);

    try {
      const registration = await this.cacheService.get(cacheKey);

      return JSON.parse(registration);
    } catch (error) {
      const registration = await this.registrationModel.findOne({
        where: { registrationId },
        raw: true,
      });
      if (registration === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(registration));
      return registration;
    }
  }

  static cacheKeyByRegistrationId(registrationId) {
    return `registration:${registrationId}`;
  }
}

module.exports = RegistrationRepository;
