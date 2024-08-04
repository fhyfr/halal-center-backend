const { attendance: attendanceMessage } = require('../helpers/responseMessage');

class AttendanceController {
  constructor(attendanceUsecase, validator) {
    this.attendanceUsecase = attendanceUsecase;
    this.validator = validator;

    this.findByAttendanceId = this.findByAttendanceId.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findByAttendanceId(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const attendance = await this.attendanceUsecase.findByAttendanceId(
        req.ability,
        req.params.id,
      );

      return res.respond(attendance);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllAttendancesPayload(req.query);

      const attendances = await this.attendanceUsecase.findAll(req);

      return res.respond(attendances);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const attendance = await this.attendanceUsecase.create(req);

      return res.respond(
        { message: attendanceMessage.create, data: attendance },
        201,
      );
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

      const attendance = await this.attendanceUsecase.update(req);

      return res.respond({
        message: attendanceMessage.update,
        data: attendance,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.attendanceUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({ message: attendanceMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = AttendanceController;
