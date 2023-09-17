const { test: testMessage } = require('../helpers/responseMessage');

class TestController {
  constructor(testUsecase, validator) {
    this.testUsecase = testUsecase;
    this.validator = validator;

    this.findByTestId = this.findByTestId.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findByTestId(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const test = await this.testUsecase.findByTestId(
        req.ability,
        req.params.id,
      );

      return res.respond(test);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllTestsPayload(req.query);

      const tests = await this.testUsecase.findAll(req);

      return res.respond(tests);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const test = await this.testUsecase.create(req);

      return res.respond({ message: testMessage.create, data: test }, 201);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      this.validator.validateUpdatePayload({
        params: req.params,
        body: req.body,
      });

      const test = await this.testUsecase.update(req);

      return res.respond({ message: testMessage.update, data: test });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.testUsecase.delete(req.ability, req.params.id);

      return res.respond({ message: testMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = TestController;
