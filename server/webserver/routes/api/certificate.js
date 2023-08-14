module.exports = function certificateRoute(
  express,
  certificateController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:certificateId', certificateController.findByCertificateId);
  router.get('/', certificateController.findAll);

  router.post('/', certificateController.create);
  router.delete('/:certificateId', certificateController.delete);

  return router;
};
