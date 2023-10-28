module.exports = function reportRouter(
  express,
  reportController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/dashboard', reportController.findDashboardReport);

  return router;
};
