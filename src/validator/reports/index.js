const InvariantError = require('../../exceptions/invariantError');
const { FindAllCoursesForReportSchema, FindByIdSchema } = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const ReportValidator = {
  validateFindByIdPayload: (payload) => {
    const validationResult = FindByIdSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllCoursesForReportPayload: (payload) => {
    const validationResult = FindAllCoursesForReportSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ReportValidator;
