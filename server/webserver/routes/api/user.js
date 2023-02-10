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
  router.get('/', userController.findAll);
  router.put('/reset-password/:id', userController.resetPassword);

  router.use(passportBearer);
  router.use(defineAbility);

  // secured endpoints
  router.get('/current/self', userController.findCurrentUser);
  router.get('/:id', userController.findById);

  router.put('/password', userController.updatePassword);
  router.put('/role', userController.updateUserRole);
  router.delete('/', userController.deleteUser);

  return router;
};
