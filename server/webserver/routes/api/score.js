module.exports = function scoreRouter(
  express,
  scoreController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/', scoreController.findAll);
  router.get('/:id', scoreController.findByScoreId);

  router.post('/', scoreController.create);
  router.put('/:id', scoreController.update);
  router.delete('/:id', scoreController.delete);

  return router;
};
