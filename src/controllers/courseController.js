const { course: courseMessage } = require('../helpers/responseMessage');

class CourseController {
  constructor(courseUsecase, validator) {
    this.courseUsecase = courseUsecase;
    this.validator = validator;

    this.findById = this.findById.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.register = this.register.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findById(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const course = await this.courseUsecase.findById(
        req.ability,
        req.params.id,
      );

      return res.respond(course);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllCoursesPayload(req.query);

      const courses = await this.courseUsecase.findAll(req);

      return res.respond(courses);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const course = await this.courseUsecase.create(req);

      return res.respond({ message: courseMessage.create, data: course }, 201);
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

      const course = await this.courseUsecase.update(req);

      return res.respond({
        message: courseMessage.update,
        data: course,
      });
    } catch (error) {
      return next(error);
    }
  }

  async register(req, res, next) {
    try {
      this.validator.validateRegisterCoursePayload(req.params);

      const result = await this.courseUsecase.registerCourse(req);

      return res.respond({
        message: courseMessage.register,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.courseUsecase.delete(req.ability, req.params.id, req.user.id);

      return res.respond({ message: courseMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = CourseController;
