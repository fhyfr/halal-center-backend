module.exports = function documentRouter(
  express,
  documentController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', documentController.findById);
  router.get('/', documentController.findAll);

  router.post('/', documentController.create);
  router.delete('/:id', documentController.delete);

  return router;
};
