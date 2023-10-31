module.exports = {
  auth: {
    login: {
      success: 'login success',
      invalidCredential: 'invalid email or password',
      differentRegisterType:
        'email has been registered with another authentication method',
      notStandardRegister: 'please use social media',
    },
    register: {
      success: 'register success',
      emailExist: 'email already exist, please use another email',
      usernameExist: 'username already exist',
    },
    refreshToken: 'token refreshed successfully',
    verify: {
      send: 'verification code has been sent',
      success: 'user verified',
      invalid: 'verification code is invalid',
      notVerified:
        'verification code is not verified yet. please verify your verification code first',
      alreadyVerified: 'verification code has already been verified',
    },
    logout: {
      success: 'logout success',
    },
  },
  user: {
    notFound: 'user not found',
    invalidOtp: 'otp is invalid',
    onlyStandardRegister:
      'user with registered using social media cannot perform this action',
    password: {
      mustMatch: 'password must match',
      updated: 'password has been updated',
      invalid: 'password is invalid',
      forgotSent: 'forgot password request has been sent',
    },
    delete: 'user has been deleted',
    null: 'user null for id: ',
    created: 'successfully created new user',
    updated: 'user has been updated',
  },
  member: {
    update: 'profile has been updated',
    bodyEmpty: 'request body cannot be empty',
    notFound: 'member not found',
    null: 'member null for id:',
  },
  role: {
    create: 'role has been created',
    notFound: 'role not found',
    update: 'role has been updated',
    exist: 'role already exist',
    null: 'role null for id: ',
  },
  upload: {
    image: {
      success: 'image has been uploaded',
      failed: 'upload image failed',
    },
    document: {
      success: 'document has been uploaded',
      failed: 'upload document failed',
    },
    sizeTooLarge: 'file size too large',
  },
  category: {
    create: 'category has been created',
    update: 'category has been updated',
    delete: 'category has been deleted',
    notFound: 'category not found',
    exist: 'category already exist',
    notEmpty: 'category not empty',
    null: 'category null for id:',
  },
  position: {
    create: 'position has been created',
    update: 'position has been updated',
    delete: 'position has been deleted',
    notFound: 'position not found',
    notEmpty: 'position not empty',
    exist: 'position already exist',
    null: 'position null for id:',
  },
  department: {
    create: 'department has been created',
    update: 'department has been updated',
    delete: 'department has been deleted',
    notFound: 'department not found',
    notEmpty: 'department not empty',
    exist: 'department already exist',
    null: 'department null for id: ',
  },
  employee: {
    create: 'employee has been created',
    update: 'employee has been updated',
    delete: 'employee has been deleted',
    notFound: 'employee not found',
    nikExist: 'employee already exist, nik:',
    null: 'employee null for id:',
  },
  course: {
    create: 'course has been created',
    update: 'course has been updated',
    delete: 'course has been deleted',
    register: 'successfully registered to course',
    notFound: 'course not found',
    nikExist: 'course already exist',
    null: 'course null for id:',
    full: 'course is no longer accept registration',
    alreadyRegistered: 'you already registered on this course',
  },
  instructor: {
    create: 'instructor has been created',
    update: 'instructor has been updated',
    delete: 'instructor has been deleted',
    notFound: 'instructor not found',
    emailExist: 'instructor already exist for email:',
    usernameExist: 'instructor already exist for username:',
    null: 'instructor null for id:',
  },
  module: {
    create: 'module has been created',
    delete: 'module has been deleted',
    notFound: 'module not found',
    null: 'module null for id:',
  },
  certificate: {
    create: 'certificate has been created',
    delete: 'certificate has been deleted',
    notFound: 'certificate not found',
    null: 'certificate null for id:',
  },
  registrationPayment: {
    create: 'registration payment has been created',
    update: 'registration payment has been updated',
    delete: 'registration payment has been deleted',
    notFound: 'registration payment not found',
    null: 'registration payment null for id:',
  },
  operationalPayment: {
    create: 'operational payment has been created',
    update: 'operational payment has been updated',
    delete: 'operational payment has been deleted',
    notFound: 'operational payment not found',
    null: 'operational payment null for id:',
  },
  registration: {
    create: 'registration has been created',
    update: 'registration has been updated',
    delete: 'registration has been deleted',
    notFound: 'registration not found',
    null: 'registration null for id:',
  },
  test: {
    create: 'test has been created',
    update: 'test has been updated',
    delete: 'test has been deleted',
    notFound: 'test not found',
    null: 'test null for id:',
  },
  score: {
    create: 'score has been created',
    update: 'score has been updated',
    delete: 'score has been deleted',
    notFound: 'score not found',
    null: 'score null for id:',
    registrationNotFound: 'registration on this course not found for user id:',
    alreadyExist: 'score test already exist for user id:',
  },
  attendance: {
    create: 'attendance has been created',
    update: 'attendance has been updated',
    delete: 'attendance has been deleted',
    notFound: 'attendance not found',
    null: 'attendance null for id:',
  },
  presence: {
    create: 'presence has been created',
    delete: 'presence has been deleted',
    notFound: 'presence not found',
    null: 'presence null for id:',
    registrationNotFound: 'registration on this course not found for user id:',
    alreadyExist: 'presence already exist for user id:',
  },
  getPublicUserProperties: (user, member, instructor, province, city) => {
    const {
      password,
      updatedBy,
      deletedAt,
      deletedBy,
      otp,
      isOtpVerified,
      ...publicUserProperties
    } = user;

    if (member) {
      const {
        id,
        userId,
        createdAt,
        updatedAt,
        deletedAt: deleteAt,
        ...publicMemberProperties
      } = member;

      Object.assign(publicUserProperties, {
        ...publicMemberProperties,
      });
    }

    if (instructor) {
      const {
        id,
        userId,
        createdAt,
        updatedAt,
        deletedAt: deletAt,
        createdBy,
        updatedBy: updatBy,
        deletedBy: deletBy,
        ...publicInstructorProperties
      } = instructor;

      Object.assign(publicUserProperties, {
        ...publicInstructorProperties,
      });
    }

    if (province) {
      const {
        id,
        createdAt,
        updatedAt,
        deletedAt: deletAt,
        ...publicProviceProperties
      } = province;

      Object.assign(publicUserProperties, {
        province: publicProviceProperties,
      });
    }

    if (city) {
      const {
        id,
        createdAt,
        updatedAt,
        deletedAt: deletAt,
        ...publicCityProperties
      } = city;

      Object.assign(publicUserProperties, {
        city: publicCityProperties,
      });
    }

    return publicUserProperties;
  },
};
