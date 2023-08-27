const Models = require('./models');

class ProvinceRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.provinceModel = Models.Province;
  }

  async findByProvinceId(id) {
    const cacheKey = this.constructor.cacheKeyByProvinceId(id);

    try {
      const province = await this.cacheService.get(cacheKey);

      return JSON.parse(province);
    } catch (error) {
      const province = await this.provinceModel.findOne({
        where: { id },
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
      attributes: ['id'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: provinceIds.count,
      rows: provinceIds.rows.map((provinceIds.rows, (province) => province.id)),
    };
  }

  static cacheKeyByProvinceId(id) {
    return `province:${id}`;
  }
}

module.exports = ProvinceRepository;
