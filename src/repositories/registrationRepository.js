const Models = require('./models');

class RegistrationRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.registrationModel = Models.Registration;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

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

  static cacheKeyById(id) {
    return `registration:${id}`;
  }
}

module.exports = RegistrationRepository;
