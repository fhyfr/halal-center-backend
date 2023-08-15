const Models = require('./models');

class CityRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.cityModel = Models.City;
  }

  async findByCityId(cityId) {
    const cacheKey = this.constructor.cacheKeyByCityId(cityId);

    try {
      const city = await this.cacheService.get(cacheKey);

      return JSON.parse(city);
    } catch (error) {
      const city = await this.cityModel.findOne({
        where: { cityId },
        raw: true,
      });

      if (city === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(city));

      return city;
    }
  }

  async findAll(offset, limit, provinceId) {
    const whereConditions = {};

    if (provinceId && provinceId !== null) {
      Object.assign(whereConditions, { provinceId });
    }

    const cityIds = await this.cityModel.findAndCountAll({
      order: [['name', 'ASC']],
      attributes: ['cityId'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    return {
      count: cityIds.count,
      rows: cityIds.rows.map((cityIds.rows, (city) => city.cityId)),
    };
  }

  static cacheKeyByCityId(cityId) {
    return `city:${cityId}`;
  }
}

module.exports = CityRepository;
