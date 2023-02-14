/* eslint-disable import/no-extraneous-dependencies */
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

const AuthUsecase = require('../../../src/usecases/authUsecase');
const UserUsecase = require('../../../src/usecases/userUsecase');
const RoleUsecase = require('../../../src/usecases/roleUsecase');
const SessionUsecase = require('../../../src/usecases/sessionUsecase');
const MemberUsecase = require('../../../src/usecases/memberUsecase');
const UploadUsecase = require('../../../src/usecases/uploadUsecase');
const CategoryUsecase = require('../../../src/usecases/categoryUsecase');

const AuthController = require('../../../src/controllers/authController');
const RoleController = require('../../../src/controllers/roleController');
const UserController = require('../../../src/controllers/userController');
const MemberController = require('../../../src/controllers/memberController');
const UploadController = require('../../../src/controllers/uploadController');
const CategoryController = require('../../../src/controllers/categoryController');

const roleValidator = require('../../../src/validator/roles');
const authValidator = require('../../../src/validator/auth');
const userValidator = require('../../../src/validator/users');
const memberValidator = require('../../../src/validator/member');
const categoryValidator = require('../../../src/validator/category');

const cacheService = new CacheService();

const sessionRepo = new SessionRepo(cacheService);
const userRepo = new UserRepo(cacheService);
const roleRepo = new RoleRepo(cacheService);
const memberRepo = new MemberRepo(cacheService);
const categoryRepo = new CategoryRepo(cacheService);

const userUsecase = new UserUsecase(userRepo, roleRepo, memberRepo);
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
const categoryUsecase = new CategoryUsecase(categoryRepo);

const authController = new AuthController(authUsecase, authValidator);
const roleController = new RoleController(roleUsecase, roleValidator);
const userController = new UserController(userUsecase, userValidator);
const memberController = new MemberController(memberUsecase, memberValidator);
const uploadController = new UploadController(uploadUsecase);
const categoryController = new CategoryController(
  categoryUsecase,
  categoryValidator,
);

const authRouter = require('./api/auth');
const roleRouter = require('./api/role');
const userRouter = require('./api/user');
const memberRouter = require('./api/member');
const uploadRouter = require('./api/upload');
const categoryRouter = require('./api/category');

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

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    errorHandler(err, res);
  });
};
