module.exports = function userRouter(
  express,
  userController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  // open endpoints
  router.post('/forgot-password', userController.forgotPassword);
  router.get('/slug/:username', userController.findByUsername);
  router.put('/reset-password/:userId', userController.resetPassword);

  router.use(passportBearer);
  router.use(defineAbility);

  // secured endpoints
  router.get('/current/self', userController.findCurrentUser);
  router.get('/:userId', userController.findUserById);
  router.get('/', userController.findAll);

  router.put('/password', userController.updatePassword);
  router.delete('/:userId', userController.deleteUser);
  router.post('/', userController.createNewUser);
  router.put('/:userId', userController.updateUser);
  router.put(
    '/reset-password/:userId/admin',
    userController.resetPasswordByAdmin,
  );

  return router;
};
