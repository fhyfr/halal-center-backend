module.exports = function positionRouter(
  express,
  positionController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', positionController.findById);
  router.get('/', positionController.findAll);
  router.post('/', positionController.create);
  router.put('/:id', positionController.update);
  router.delete('/:id', positionController.delete);

  return router;
};
