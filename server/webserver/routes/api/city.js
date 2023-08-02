module.exports = function provinceRouter(
  express,
  cityController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/', cityController.findAll);
  router.get('/:id', cityController.findById);

  return router;
};
