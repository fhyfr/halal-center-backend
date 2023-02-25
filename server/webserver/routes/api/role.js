module.exports = function roleRouter(
  express,
  roleController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/', roleController.findAll);
  router.post('/', roleController.create);

  return router;
};
