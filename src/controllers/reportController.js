class ReportController {
  constructor(reportUsecase) {
    this.reportUsecase = reportUsecase;

    this.findDashboardReport = this.findDashboardReport.bind(this);
  }

  async findDashboardReport(req, res, next) {
    try {
      const report = await this.reportUsecase.findDashboardReport(req.ability);

      return res.respond({ message: 'success', data: report });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = ReportController;
