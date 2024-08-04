const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const { province: provinceMessage } = require('../helpers/responseMessage');
const { getPagingData, getPagination } = require('../helpers/pagination');
const logger = require('../helpers/logger');

class ProvinceUsecase {
  constructor(provinceRepo) {
    this.provinceRepo = provinceRepo;
  }

  async findByProvinceId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Province');

    const province = await this.provinceRepo.findByProvinceId(id);
    if (province === null) {
      throw new NotFoundError(provinceMessage.notFound);
    }

    return this.constructor.resolveProvinceData(province);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Province');

    const { page, size, id } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.provinceRepo.findAll(offset, limit, id);

    const dataRows = {
      count: ids.count,
      rows: await this.resolveProvinces(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async resolveProvinces(ids) {
    const provinces = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const province = await this.provinceRepo.findByProvinceId(nextID);
      if (province == null) {
        logger.error(`${provinceMessage.null} ${nextID}`);
      } else {
        provinces.push(this.constructor.resolveProvinceData(province));
      }
    }, Promise.resolve());

    return provinces;
  }

  static resolveProvinceData(province) {
    const { deletedAt, ...provinceData } = province;
    return provinceData;
  }
}

module.exports = ProvinceUsecase;
