const { instructor: instructorMessage } = require('../helpers/responseMessage');

class InstructorController {
  constructor(instructorUsecase, validator) {
    this.instructorUsecase = instructorUsecase;
    this.validator = validator;

    this.findById = this.findById.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findById(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeleteInstructorPayload(req.params);

      const instructor = await this.instructorUsecase.findById(
        req.ability,
        req.params.id,
      );

      return res.respond(instructor);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllInstructorsPayload(req.query);

      const instructors = await this.instructorUsecase.findAll(req);

      return res.respond(instructors);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreateInstructorPayload(req.body);

      const instructor = await this.instructorUsecase.create(req);

      return res.respond(
        { message: instructorMessage.create, data: instructor },
        201,
      );
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      this.validator.validateUpdateInstructorPayload({
        params: req.params,
        body: req.body,
      });

      const instructor = await this.instructorUsecase.update(req);

      return res.respond({
        message: instructorMessage.update,
        data: instructor,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeleteInstructorPayload(req.params);

      await this.instructorUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({ message: instructorMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = InstructorController;
