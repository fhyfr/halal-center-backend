const { ForbiddenError } = require('@casl/ability');

class ReportUsecase {
  constructor(courseRepo, userRepo) {
    this.courseRepo = courseRepo;
    this.userRepo = userRepo;
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
}

module.exports = ReportUsecase;
