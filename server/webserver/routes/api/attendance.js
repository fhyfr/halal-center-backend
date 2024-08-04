module.exports = function attendanceRouter(
  express,
  attendanceController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/', attendanceController.findAll);
  router.get('/:id', attendanceController.findByAttendanceId);

  router.post('/', attendanceController.create);
  router.put('/:id', attendanceController.update);
  router.delete('/:id', attendanceController.delete);

  return router;
};
