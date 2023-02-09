module.exports = function authRouter(
  express,
  authController,
  passportRefreshToken,
  passportBearer,
) {
  const router = express.Router();

  router.post('/login', authController.login);
  router.post(
    '/refresh-token',
    passportRefreshToken,
    authController.refreshToken,
  );
  router.post('/register', authController.register);
  router.post('/logout', passportBearer, authController.logout);
  router.post('/verify-otp', authController.verifyUser);
  router.post('/resend-otp', authController.resendVerificationCode);

  return router;
};
