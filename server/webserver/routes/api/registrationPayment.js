module.exports = function registrationPaymentRouter(
  express,
  registrationPaymentController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', registrationPaymentController.findByRegistrationPaymentId);
  router.get('/', registrationPaymentController.findAll);
  router.post('/', registrationPaymentController.create);
  router.put('/:id', registrationPaymentController.update);
  router.delete('/:id', registrationPaymentController.delete);

  return router;
};
