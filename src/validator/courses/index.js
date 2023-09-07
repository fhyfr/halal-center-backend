const InvariantError = require('../../exceptions/invariantError');
const {
  FindByIdOrDeleteCourseSchema,
  FindAllCoursesSchema,
  FindAllCoursesOfInstructorSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  RegisterCourseSchema,
} = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const CourseValidator = {
  validateFindByIdOrDeletePayload: (payload) => {
    const validationResult = FindByIdOrDeleteCourseSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllCoursesPayload: (payload) => {
    const validationResult = FindAllCoursesSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllCoursesOfInstructorPayload: (payload) => {
    const validationResult = FindAllCoursesOfInstructorSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreatePayload: (payload) => {
    const validationResult = CreateCourseSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdatePayload: (payload) => {
    const validationResult = UpdateCourseSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateRegisterCoursePayload: (payload) => {
    const validationResult = RegisterCourseSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CourseValidator;
