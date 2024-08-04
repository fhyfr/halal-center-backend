class CityController {
  constructor(cityUsecase, validator) {
    this.cityUsecase = cityUsecase;
    this.validator = validator;

    this.findByCityId = this.findByCityId.bind(this);
    this.findAll = this.findAll.bind(this);
  }

  async findByCityId(req, res, next) {
    try {
      this.validator.validateFindByIdPayload(req.params);

      const city = await this.cityUsecase.findByCityId(
        req.ability,
        req.params.id,
      );

      return res.respond(city);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllCitiesPayload(req.query);

      const cities = await this.cityUsecase.findAll(req);

      return res.respond(cities);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = CityController;
