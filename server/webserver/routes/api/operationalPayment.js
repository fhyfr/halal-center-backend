module.exports = function operationalPaymentRouter(
  express,
  operationalPaymentController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', operationalPaymentController.findByOperationalPaymentId);
  router.get('/', operationalPaymentController.findAll);
  router.post('/', operationalPaymentController.create);
  router.put('/:id', operationalPaymentController.update);
  router.delete('/:id', operationalPaymentController.delete);

  return router;
};
