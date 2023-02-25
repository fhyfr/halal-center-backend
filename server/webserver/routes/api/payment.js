module.exports = function paymentRouter(
  express,
  paymentController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', paymentController.findById);
  router.get('/', paymentController.findAll);
  router.post('/', paymentController.create);
  router.put('/:id', paymentController.update);
  router.delete('/:id', paymentController.delete);

  return router;
};
