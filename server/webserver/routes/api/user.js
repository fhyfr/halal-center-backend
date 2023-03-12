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
  router.put('/reset-password/:id', userController.resetPassword);

  router.use(passportBearer);
  router.use(defineAbility);

  // secured endpoints
  router.get('/current/self', userController.findCurrentUser);
  router.get('/:id', userController.findById);
  router.get('/', userController.findAll);

  router.put('/password', userController.updatePassword);
  router.delete('/:id', userController.deleteUser);
  router.post('/', userController.createNewUser);
  router.put('/:id', userController.updateUser);
  router.put('/reset-password/:id/admin', userController.resetPasswordByAdmin);

  return router;
};
