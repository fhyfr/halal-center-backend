module.exports = function positionRouter(
  express,
  positionController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:positionId', positionController.findByPositionId);
  router.get('/', positionController.findAll);
  router.post('/', positionController.create);
  router.put('/:positionId', positionController.update);
  router.delete('/:positionId', positionController.delete);

  return router;
};
