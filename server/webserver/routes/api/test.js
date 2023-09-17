module.exports = function testRouter(
  express,
  testController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/', testController.findAll);
  router.get('/:id', testController.findByTestId);

  router.post('/', testController.create);
  router.put('/:id', testController.update);
  router.delete('/:id', testController.delete);

  return router;
};
