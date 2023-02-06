module.exports = function authRouter(
  express,
  authController,
  passportRefreshToken,
  passportBearer,
) {
  const router = express.Router();

  router.post('/login', authController.login);
  router.post('/refresh', passportRefreshToken, authController.refreshToken);
  router.post('/register-email', authController.registerEmail);
  router.post('/logout', passportBearer, authController.logout);

  return router;
};
