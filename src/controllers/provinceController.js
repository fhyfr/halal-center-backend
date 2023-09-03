class ProvinceController {
  constructor(provinceUsecase, validator) {
    this.provinceUsecase = provinceUsecase;
    this.validator = validator;

    this.findByProvinceId = this.findByProvinceId.bind(this);
    this.findAll = this.findAll.bind(this);
  }

  async findByProvinceId(req, res, next) {
    try {
      this.validator.validateFindByIdPayload(req.params);

      const province = await this.provinceUsecase.findByProvinceId(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond(province);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllProvincesPayload(req.query);

      const provinces = await this.provinceUsecase.findAll(req);

      return res.respond(provinces);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = ProvinceController;
