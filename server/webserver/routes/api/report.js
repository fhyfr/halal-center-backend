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
  router.get('/courses', reportController.findCoursesReport);
  router.get('/courses/:id', reportController.findCourseReportByCourseId);

  return router;
};
