module.exports = function instructorRouter(
  express,
  instructorController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', instructorController.findById);
  router.get('/', instructorController.findAll);
  router.post('/', instructorController.create);
  router.put('/:id', instructorController.update);
  router.delete('/:id', instructorController.delete);

  return router;
};
