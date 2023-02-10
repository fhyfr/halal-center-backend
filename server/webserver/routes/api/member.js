module.exports = function memberRouter(
  express,
  memberController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.put('/', memberController.updateProfile);

  return router;
};
