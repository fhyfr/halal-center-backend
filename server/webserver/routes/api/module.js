module.exports = function moduleRouter(
  express,
  moduleController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:moduleId', moduleController.findByModuleId);
  router.get('/', moduleController.findAll);

  router.post('/', moduleController.create);
  router.delete('/:moduleId', moduleController.delete);

  return router;
};
