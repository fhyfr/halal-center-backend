module.exports = function registrationPaymentRouter(
  express,
  registrationPaymentController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get(
    '/:registrationPaymentId',
    registrationPaymentController.findByRegistrationPaymentId,
  );
  router.get('/', registrationPaymentController.findAll);
  router.post('/', registrationPaymentController.create);
  router.put('/:registrationPaymentId', registrationPaymentController.update);
  router.delete(
    '/:registrationPaymentId',
    registrationPaymentController.delete,
  );

  return router;
};
