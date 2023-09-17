const passport = require('passport');
const compression = require('compression');
const BearerStrategy = require('passport-http-bearer').Strategy;

const { errorHandler } = require('../../../src/exceptions/errorHandler');
const AuthenticationError = require('../../../src/exceptions/authenticationError');
const responseHandler =
  require('../../../src/helpers/responseHandler').helper();
const { defineAbility } = require('../../../src/helpers/userAbility');

const CacheService = require('../../database/redis/index');

const SessionRepo = require('../../../src/repositories/sessionRepository');
const UserRepo = require('../../../src/repositories/userRepository');
const RoleRepo = require('../../../src/repositories/roleRepository');
const MemberRepo = require('../../../src/repositories/memberRepository');
const CategoryRepo = require('../../../src/repositories/categoryRepository');
const CourseRepo = require('../../../src/repositories/courseRepository');
const InstructorRepo = require('../../../src/repositories/instructorRepository');
const ModuleRepo = require('../../../src/repositories/moduleRepository');
const CertificateRepo = require('../../../src/repositories/certificateRepository');
const ProvinceRepo = require('../../../src/repositories/provinceRepository');
const CityRepo = require('../../../src/repositories/cityRepository');
const RegistrationPaymentRepo = require('../../../src/repositories/registrationPaymentRepository');
const OperationalPaymentRepo = require('../../../src/repositories/operationalPaymentRepository');
const RegistrationRepo = require('../../../src/repositories/registrationRepository');
const MentorRepo = require('../../../src/repositories/mentorRepository');
const TestRepo = require('../../../src/repositories/testRepository');

const AuthUsecase = require('../../../src/usecases/authUsecase');
const UserUsecase = require('../../../src/usecases/userUsecase');
const RoleUsecase = require('../../../src/usecases/roleUsecase');
const SessionUsecase = require('../../../src/usecases/sessionUsecase');
const MemberUsecase = require('../../../src/usecases/memberUsecase');
const UploadUsecase = require('../../../src/usecases/uploadUsecase');
const CategoryUsecase = require('../../../src/usecases/categoryUsecase');
const CourseUsecase = require('../../../src/usecases/courseUsecase');
const InstructorUsecase = require('../../../src/usecases/instructorUsecase');
const ModuleUsecase = require('../../../src/usecases/moduleUsecase');
const CertificateUsecase = require('../../../src/usecases/certificateUsecase');
const ProvinceUsecase = require('../../../src/usecases/provinceUsecase');
const CityUsecase = require('../../../src/usecases/cityUsecase');
const RegistrationPaymentUsecase = require('../../../src/usecases/registrationPaymentUsecase');
const OperationalPaymentUsecase = require('../../../src/usecases/operationalPaymentUsecase');
const TestUsecase = require('../../../src/usecases/testUsecase');

const AuthController = require('../../../src/controllers/authController');
const RoleController = require('../../../src/controllers/roleController');
const UserController = require('../../../src/controllers/userController');
const MemberController = require('../../../src/controllers/memberController');
const UploadController = require('../../../src/controllers/uploadController');
const CategoryController = require('../../../src/controllers/categoryController');
const CourseController = require('../../../src/controllers/courseController');
const InstructorController = require('../../../src/controllers/instructorController');
const ModuleController = require('../../../src/controllers/moduleController');
const CertificateController = require('../../../src/controllers/certificateController');
const ProvinceController = require('../../../src/controllers/provinceController');
const CityController = require('../../../src/controllers/cityController');
const RegistrationPaymentController = require('../../../src/controllers/registrationPaymentController');
const OperationalPaymentController = require('../../../src/controllers/operationalPaymentController');
const TestController = require('../../../src/controllers/testController');

const roleValidator = require('../../../src/validator/roles');
const authValidator = require('../../../src/validator/auth');
const userValidator = require('../../../src/validator/users');
const memberValidator = require('../../../src/validator/members');
const categoryValidator = require('../../../src/validator/categories');
const courseValidator = require('../../../src/validator/courses');
const instructorValidator = require('../../../src/validator/instructors');
const moduleValidator = require('../../../src/validator/modules');
const certificateValidator = require('../../../src/validator/certificates');
const provinceValidator = require('../../../src/validator/provinces');
const cityValidator = require('../../../src/validator/cities');
const registrationPaymentValidator = require('../../../src/validator/registration_payments');
const operationalPaymentValidator = require('../../../src/validator/operational_payments');
const testValidator = require('../../../src/validator/tests');

// services
const cacheService = new CacheService();

// repositories
const sessionRepo = new SessionRepo(cacheService);
const userRepo = new UserRepo(cacheService);
const roleRepo = new RoleRepo(cacheService);
const memberRepo = new MemberRepo(cacheService);
const categoryRepo = new CategoryRepo(cacheService);
const courseRepo = new CourseRepo(cacheService);
const instructorRepo = new InstructorRepo(cacheService);
const moduleRepo = new ModuleRepo(cacheService);
const cerficateRepo = new CertificateRepo(cacheService);
const provinceRepo = new ProvinceRepo(cacheService);
const cityRepo = new CityRepo(cacheService);
const registrationRepo = new RegistrationRepo(cacheService);
const registrationPaymentRepo = new RegistrationPaymentRepo(cacheService);
const operationalPaymentRepo = new OperationalPaymentRepo(cacheService);
const mentorRepo = new MentorRepo(cacheService);
const testRepo = new TestRepo(cacheService);

// usecases
const userUsecase = new UserUsecase(
  userRepo,
  roleRepo,
  memberRepo,
  instructorRepo,
);
const roleUsecase = new RoleUsecase(roleRepo);
const sessionUsecase = new SessionUsecase(sessionRepo, userRepo);
const memberUsecase = new MemberUsecase(memberRepo, userRepo);
const authUsecase = new AuthUsecase(
  userUsecase,
  sessionUsecase,
  roleUsecase,
  memberUsecase,
);
const uploadUsecase = new UploadUsecase();
const categoryUsecase = new CategoryUsecase(categoryRepo, courseRepo);
const courseUsecase = new CourseUsecase(
  courseRepo,
  categoryRepo,
  instructorRepo,
);
const instructorUsecase = new InstructorUsecase(
  instructorRepo,
  courseRepo,
  mentorRepo,
  userRepo,
  provinceRepo,
  cityRepo,
);
const moduleUsecase = new ModuleUsecase(moduleRepo, courseRepo);
const certificateUsecase = new CertificateUsecase(
  cerficateRepo,
  courseRepo,
  memberRepo,
  instructorRepo,
);
const provinceUsecase = new ProvinceUsecase(provinceRepo);
const cityUsecase = new CityUsecase(cityRepo, provinceRepo);
const registrationPaymentUsecase = new RegistrationPaymentUsecase(
  registrationPaymentRepo,
  registrationRepo,
);
const operationalPaymentUsecase = new OperationalPaymentUsecase(
  operationalPaymentRepo,
  courseRepo,
);
const testUsecase = new TestUsecase(testRepo, courseRepo);

// controllers
const authController = new AuthController(authUsecase, authValidator);
const roleController = new RoleController(roleUsecase, roleValidator);
const userController = new UserController(userUsecase, userValidator);
const memberController = new MemberController(memberUsecase, memberValidator);
const uploadController = new UploadController(uploadUsecase);
const categoryController = new CategoryController(
  categoryUsecase,
  categoryValidator,
);
const courseController = new CourseController(courseUsecase, courseValidator);
const instructorController = new InstructorController(
  instructorUsecase,
  instructorValidator,
);
const moduleController = new ModuleController(moduleUsecase, moduleValidator);
const certificateController = new CertificateController(
  certificateUsecase,
  certificateValidator,
);
const provinceController = new ProvinceController(
  provinceUsecase,
  provinceValidator,
);
const cityController = new CityController(cityUsecase, cityValidator);
const registrationPaymentController = new RegistrationPaymentController(
  registrationPaymentUsecase,
  registrationPaymentValidator,
);
const operationalPaymentController = new OperationalPaymentController(
  operationalPaymentUsecase,
  operationalPaymentValidator,
);
const testController = new TestController(testUsecase, testValidator);

// routers
const authRouter = require('./api/auth');
const roleRouter = require('./api/role');
const userRouter = require('./api/user');
const memberRouter = require('./api/member');
const uploadRouter = require('./api/upload');
const categoryRouter = require('./api/category');
const courseRouter = require('./api/course');
const instructorRouter = require('./api/instructor');
const moduleRouter = require('./api/module');
const certificateRouter = require('./api/certificate');
const provinceRouter = require('./api/province');
const cityRouter = require('./api/city');
const registrationPaymentRouter = require('./api/registrationPayment');
const operationalPaymentRouter = require('./api/operationalPayment');
const testRouter = require('./api/test');

class OptionalTokenStrategy {
  authenticate(req) {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) return this.success();

    const token = bearerToken.split('Bearer ')[1];

    if (!token) return this.success();

    sessionUsecase.isAccessTokenValid(token).then((user) => {
      if (!user) return this.success();

      return this.success(user);
    });
  }
}

passport.use(
  new BearerStrategy((token, cb) => {
    sessionUsecase.isAccessTokenValid(token).then((user) => {
      if (!user) return cb(null, false);

      return cb(null, user);
    });
  }),
);

passport.use('optional-token', new OptionalTokenStrategy());

passport.use(
  'refresh-token',
  new BearerStrategy((refreshToken, cb) => {
    sessionUsecase.isRefreshTokenValid(refreshToken).then((isValid) => {
      if (!isValid) return cb(null, false);

      return cb(null, { refreshToken });
    });
  }),
);

const defineAbilityMiddleware = (req, res, next) => {
  req.ability = defineAbility(req.user);
  next();
};

const passportBearer = (req, res, next) =>
  passport.authenticate('bearer', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return next(new AuthenticationError('unauthorized'));

    req.user = user;
    return next();
  })(req, res, next);

const passportRefreshToken = (req, res, next) =>
  passport.authenticate('refresh-token', { session: false }, (err, token) => {
    if (err) return next(err);
    if (!token) return next(new AuthenticationError('invalid refresh token'));

    req.user = token;
    return next();
  })(req, res, next);

module.exports = function routes(app, express) {
  app.use(responseHandler);
  app.use(passport.initialize());
  app.use(compression());

  app.use(
    '/api/v1/auth',
    authRouter(express, authController, passportRefreshToken, passportBearer),
  );

  app.use(
    '/api/v1/role',
    roleRouter(
      express,
      roleController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/user',
    userRouter(
      express,
      userController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/member',
    memberRouter(
      express,
      memberController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/upload',
    uploadRouter(express, uploadController, passportBearer),
  );

  app.use(
    '/api/v1/category',
    categoryRouter(
      express,
      categoryController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/course',
    courseRouter(
      express,
      courseController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/instructor',
    instructorRouter(
      express,
      instructorController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/module',
    moduleRouter(
      express,
      moduleController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/certificate',
    certificateRouter(
      express,
      certificateController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/province',
    provinceRouter(
      express,
      provinceController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/city',
    cityRouter(
      express,
      cityController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/registration-payment',
    registrationPaymentRouter(
      express,
      registrationPaymentController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/operational-payment',
    operationalPaymentRouter(
      express,
      operationalPaymentController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  app.use(
    '/api/v1/test',
    testRouter(
      express,
      testController,
      passportBearer,
      defineAbilityMiddleware,
    ),
  );

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    errorHandler(err, res);
  });
};
