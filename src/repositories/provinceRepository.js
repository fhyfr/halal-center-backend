const Models = require('./models');

class ProvinceRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.provinceModel = Models.Province;
  }

  async findByProvinceId(provinceId) {
    const cacheKey = this.constructor.cacheKeyByProvinceId(provinceId);

    try {
      const province = await this.cacheService.get(cacheKey);

      return JSON.parse(province);
    } catch (error) {
      const province = await this.provinceModel.findOne({
        where: { provinceId },
        raw: true,
      });

      if (province === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(province));

      return province;
    }
  }

  async findAll(offset, limit) {
    const provinceIds = await this.provinceModel.findAndCountAll({
      order: [['name', 'ASC']],
      attributes: ['provinceId'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: provinceIds.count,
      rows: provinceIds.rows.map(
        (provinceIds.rows, (province) => province.provinceId),
      ),
    };
  }

  static cacheKeyByProvinceId(provinceId) {
    return `province:${provinceId}`;
  }
}

module.exports = ProvinceRepository;
