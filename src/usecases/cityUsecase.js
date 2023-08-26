const { ForbiddenError } = require('@casl/ability');
const { city: cityMessage } = require('../helpers/responseMessage');
const logger = require('../helpers/logger');
const NotFoundError = require('../exceptions/notFoundError');
const { getPagination, getPagingData } = require('../helpers/pagination');

class CityUsecase {
  constructor(cityRepo, provinceRepo) {
    this.cityRepo = cityRepo;
    this.provinceRepo = provinceRepo;
  }

  async findByCityId(ability, cityId) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'City');

    const city = await this.cityRepo.findByCityId(cityId);
    if (city === null) {
      throw new NotFoundError(cityMessage.notFound);
    }

    return this.resolveCityData(city);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'City');

    const { page, size, provinceId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.cityRepo.findAll(offset, limit, provinceId);

    const dataRows = {
      count: ids.count,
      rows: await this.resolveCities(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async resolveCities(ids) {
    const cities = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const city = await this.cityRepo.findByCityId(nextID);

      if (city == null) {
        logger.error(`${cityMessage.null} ${nextID}`);
      } else {
        cities.push(await this.resolveCityData(city));
      }
    }, Promise.resolve());

    return cities;
  }

  async resolveCityData(city) {
    const { deletedAt, ...cityData } = city;

    // get province data
    let province = await this.provinceRepo.findByProvinceId(
      cityData.provinceId,
    );

    if (province && province !== null) {
      // eslint-disable-next-line no-shadow
      const { deletedAt, ...provinceData } = province;
      province = provinceData;
    }

    Object.assign(cityData, { province });
    return cityData;
  }
}

module.exports = CityUsecase;
