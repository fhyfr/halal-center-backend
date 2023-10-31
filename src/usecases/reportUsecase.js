const { ForbiddenError } = require('@casl/ability');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const { course: courseMessage } = require('../helpers/responseMessage');
const NotFoundError = require('../exceptions/notFoundError');

class ReportUsecase {
  constructor(courseRepo, userRepo, categoryRepo) {
    this.courseRepo = courseRepo;
    this.userRepo = userRepo;
    this.categoryRepo = categoryRepo;
  }

  async findDashboardReport(ability) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Report');

    const totalCourses = await this.courseRepo.countTotalCourses();
    const totalSuccessCourses =
      await this.courseRepo.countTotalSuccessCourses();
    const totalMembers = await this.userRepo.countTotalMembers();
    const totalInstructors = await this.userRepo.countTotalInstructors();

    return {
      totalCourses,
      totalSuccessCourses,
      totalMembers,
      totalInstructors,
    };
  }

  async findCoursesReport(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Report');

    const { page, size, courseId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.courseRepo.findAllCoursesForReport(
      offset,
      limit,
      courseId,
    );
    const dataRows = {
      count: ids.count,
      rows: await this.resolveReportCourses(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async findCourseReportByCourseId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Report');

    const course = await this.courseRepo.findById(id);
    if (course === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    return this.resolveReportCourseData(course);
  }

  async resolveReportCourses(ids, userId) {
    const courses = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const course = await this.courseRepo.findById(nextID);

      if (course == null) {
        logger.error(`${courseMessage.null} ${nextID}`);
      } else if (userId && userId > 0) {
        courses.push(await this.resolveReportCourseData(course, userId));
      } else {
        courses.push(await this.resolveReportCourseData(course));
      }
    }, Promise.resolve());

    return courses;
  }

  async resolveReportCourseData(course) {
    const { deletedAt, deletedBy, ...courseData } = course;

    const courseCategory = await this.categoryRepo.findById(
      courseData.categoryId,
    );

    if (courseCategory !== null) {
      delete courseCategory.deletedBy;
      delete courseCategory.deletedAt;

      Object.assign(courseData, {
        category: courseCategory,
      });
    }

    const totalParticipants =
      await this.courseRepo.countTotalParticipantsByCourseId(courseData.id);
    const totalInstructors =
      await this.courseRepo.countTotalInstructorsByCourseId(courseData.id);

    Object.assign(courseData, {
      totalParticipants,
      totalInstructors,
    });

    return courseData;
  }
}

module.exports = ReportUsecase;
