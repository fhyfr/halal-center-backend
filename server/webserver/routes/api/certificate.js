module.exports = function certificateRoute(
  express,
  certificateController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', certificateController.findByCertificateId);
  router.get('/', certificateController.findAll);

  router.post('/', certificateController.create);
  router.delete('/:id', certificateController.delete);

  return router;
};
