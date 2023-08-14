module.exports = function instructorRouter(
  express,
  instructorController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:instructorId', instructorController.findByInstructorId);
  router.get('/', instructorController.findAll);
  router.post('/', instructorController.create);
  router.put('/:instructorId', instructorController.update);
  router.delete('/:instructorId', instructorController.delete);

  return router;
};
