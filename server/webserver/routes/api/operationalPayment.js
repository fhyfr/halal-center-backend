module.exports = function operationalPaymentRouter(
  express,
  operationalPaymentController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get(
    '/:operationalPaymentId',
    operationalPaymentController.findByOperationalPaymentId,
  );
  router.get('/', operationalPaymentController.findAll);
  router.post('/', operationalPaymentController.create);
  router.put('/:operationalPaymentId', operationalPaymentController.update);
  router.delete('/:operationalPaymentId', operationalPaymentController.delete);

  return router;
};
