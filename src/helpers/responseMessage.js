module.exports = {
  auth: {
    login: {
      success: 'login succeed',
      invalidCredential: 'email or password is invalid',
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
      send: 'verification has been sent',
      success: 'user has been verified successfully',
      invalid: 'verification code is invalid',
      notVerified: 'user is not verified yet. please verify first',
      alreadyVerified: 'user has already been verified',
    },
    logout: {
      success: 'logout succeed',
    },
  },
  user: {
    update: 'user has been updated',
    notFound: 'user not found',
    invalidOtp: 'otp is invalid',
    onlyStandardRegister:
      'user with registered using social media cannot perform this action',
    password: {
      updated: 'password has been updated',
      invalid: 'password is invalid',
      forgotSent: 'forgot password request has been sent',
    },
    delete: 'user has been deleted',
  },
  role: {
    create: 'role has been created',
    notFound: 'role not found',
    update: 'role has been updated',
    exist: 'role already exist',
  },
};
