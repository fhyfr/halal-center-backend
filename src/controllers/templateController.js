class TemplateController {
  constructor(templateUsecase, validator) {
    this.templateUsecase = templateUsecase;
    this.validator = validator;

    this.getCertificateTemplateByCourseId =
      this.getCertificateTemplateByCourseId.bind(this);
  }

  async getCertificateTemplateByCourseId(req, res, next) {
    try {
      this.validator.validateCertificatePayload(req.params);

      const workbook =
        await this.templateUsecase.getCertificateTemplateByCourseId(
          req.ability,
          req.params.courseId,
        );

      // set up the response headers
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=certificates.xlsx',
      });

      // write the workbook to the response object
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TemplateController;
