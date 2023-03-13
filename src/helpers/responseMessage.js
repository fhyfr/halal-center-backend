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
      failedImage: 'upload image failed',
      failedDocument: 'upload document failed',
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
    null: 'instructor null for id:',
  },
  document: {
    create: 'document has been created',
    delete: 'document has been deleted',
    notFound: 'document not found',
    null: 'document null for id:',
  },
  promotion: {
    create: 'promotion has been created',
    delete: 'promotion has been deleted',
    resend: 'promotion has been resent',
    notFound: 'promotion not found',
    null: 'promotion null for id:',
  },
  payment: {
    create: 'payment has been created',
    update: 'payment has been updated',
    delete: 'payment has been deleted',
    notFound: 'payment not found',
    null: 'payment null for id:',
  },
  getPublicUserProperties: (user, member) => {
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

    return publicUserProperties;
  },
};
