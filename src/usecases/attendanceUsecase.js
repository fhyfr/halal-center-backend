const { ForbiddenError } = require('@casl/ability');

const {
  attendance: attendanceMessage,
  course: courseMessage,
} = require('../helpers/responseMessage');
const NotFoundError = require('../exceptions/notFoundError');
const logger = require('../helpers/logger');
const { getPagingData, getPagination } = require('../helpers/pagination');

class AttendanceUsecase {
  constructor(attendanceRepo, courseRepo) {
    this.attendanceRepo = attendanceRepo;
    this.courseRepo = courseRepo;
  }

  async findByAttendanceId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Attendance');

    const attendance = await this.attendanceRepo.findByAttendanceId(id);
    if (attendance === null) {
      throw new NotFoundError(attendanceMessage.notFound);
    }

    return this.resolveAttendanceData(attendance);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Attendance');

    const { page, size, courseId, active } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.attendanceRepo.findAll(
      offset,
      limit,
      courseId,
      active,
    );

    const dataRows = {
      count: ids.count,
      rows: await this.resolveAttendances(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Attendance');

    // validate course
    const isCourseExist = await this.courseRepo.findById(req.body.courseId);
    if (!isCourseExist || isCourseExist === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const attendance = await this.attendanceRepo.create(req.body);
    return this.resolveAttendanceData(attendance);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Attendance');

    // validate attendance
    const isAttendanceExist = await this.attendanceRepo.findByAttendanceId(
      req.params.id,
    );
    if (!isAttendanceExist || isAttendanceExist === null) {
      throw new NotFoundError(attendanceMessage.notFound);
    }

    // validate course
    if (req.body.courseId !== isAttendanceExist.courseId) {
      const isCourseExist = await this.courseRepo.findById(req.body.courseId);
      if (!isCourseExist || isCourseExist === null) {
        throw new NotFoundError(courseMessage.notFound);
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    const result = await this.attendanceRepo.update(req.body);
    return this.resolveAttendanceData(result);
  }

  async delete(ability, id, deleterId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Attendance');

    // validate attendance
    const isAttendanceExist = await this.attendanceRepo.findByAttendanceId(id);
    if (!isAttendanceExist || isAttendanceExist === null) {
      throw new NotFoundError(attendanceMessage.notFound);
    }

    await this.attendanceRepo.deleteById(id, deleterId);
  }

  async resolveAttendances(ids) {
    const attendances = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const attendance = await this.attendanceRepo.findByAttendanceId(nextID);

      if (attendance === null) {
        logger.error(`${attendanceMessage.null} ${nextID}`);
      } else {
        attendances.push(await this.resolveAttendanceData(attendance));
      }
    }, Promise.resolve());

    return attendances;
  }

  async resolveAttendanceData(attendance) {
    const { deletedAt, deletedBy, ...attendanceData } = attendance;
    let courseData = {};

    const course = await this.courseRepo.findById(attendance.courseId);
    if (course !== null) {
      const {
        id,
        deletedAt: deletedAtCourse,
        deletedBy: deletedByCourse,
        ...restCourse
      } = course;

      courseData = { ...restCourse };
    }

    Object.assign(attendanceData, {
      course: courseData,
    });

    return attendanceData;
  }
}

module.exports = AttendanceUsecase;
