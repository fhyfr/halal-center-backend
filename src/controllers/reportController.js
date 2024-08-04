class ReportController {
  constructor(reportUsecase, validator) {
    this.reportUsecase = reportUsecase;
    this.validator = validator;

    this.findDashboardReport = this.findDashboardReport.bind(this);
    this.findCoursesReport = this.findCoursesReport.bind(this);
    this.findCourseReportByCourseId =
      this.findCourseReportByCourseId.bind(this);
    this.findCourseRankReportByCourseId =
      this.findCourseRankReportByCourseId.bind(this);
  }

  async findDashboardReport(req, res, next) {
    try {
      const report = await this.reportUsecase.findDashboardReport(req.ability);

      return res.respond({ message: 'success', data: report });
    } catch (error) {
      return next(error);
    }
  }

  async findCoursesReport(req, res, next) {
    try {
      this.validator.validateFindAllCoursesForReportPayload(req.query);

      const reportCourses = await this.reportUsecase.findCoursesReport(req);

      return res.respond(reportCourses);
    } catch (error) {
      return next(error);
    }
  }

  async findCourseReportByCourseId(req, res, next) {
    try {
      this.validator.validateFindByIdPayload(req.params);

      const reportCourse = await this.reportUsecase.findCourseReportByCourseId(
        req.ability,
        req.params.id,
      );

      return res.respond(reportCourse);
    } catch (error) {
      return next(error);
    }
  }

  async findCourseRankReportByCourseId(req, res, next) {
    try {
      this.validator.validateFindByIdPayload(req.params);

      const reportCourseRank =
        await this.reportUsecase.findCourseRankReportByCourseId(
          req.ability,
          req.params.id,
        );

      return res.respond(reportCourseRank);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = ReportController;
