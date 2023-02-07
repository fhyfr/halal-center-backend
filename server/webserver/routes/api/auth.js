module.exports = function authRouter(
  express,
  authController,
  passportRefreshToken,
  passportBearer,
) {
  const router = express.Router();

  router.post('/login', authController.login);
  router.post('/refresh', passportRefreshToken, authController.refreshToken);
  router.post('/register', authController.register);
  router.post('/logout', passportBearer, authController.logout);

  return router;
};
