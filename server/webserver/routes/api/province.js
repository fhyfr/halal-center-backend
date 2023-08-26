module.exports = function provinceRouter(
  express,
  provinceController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/', provinceController.findAll);
  router.get('/:provinceId', provinceController.findByProvinceId);

  return router;
};
