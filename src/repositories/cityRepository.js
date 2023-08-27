const Models = require('./models');

class CityRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.cityModel = Models.City;
  }

  async findByCityId(id) {
    const cacheKey = this.constructor.cacheKeyByCityId(id);

    try {
      const city = await this.cacheService.get(cacheKey);

      return JSON.parse(city);
    } catch (error) {
      const city = await this.cityModel.findOne({
        where: { id },
        raw: true,
      });

      if (city === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(city));

      return city;
    }
  }

  async findAll(offset, limit, provinceId) {
    const whereConditions = {};

    if (provinceId && provinceId > 0) {
      Object.assign(whereConditions, { provinceId });
    }

    const cityIds = await this.cityModel.findAndCountAll({
      order: [['name', 'ASC']],
      attributes: ['id'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    return {
      count: cityIds.count,
      rows: cityIds.rows.map((cityIds.rows, (city) => city.id)),
    };
  }

  static cacheKeyByCityId(id) {
    return `city:${id}`;
  }
}

module.exports = CityRepository;
