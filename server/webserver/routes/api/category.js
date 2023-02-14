module.exports = function categoryRouter(
  express,
  categoryController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  // open routers
  router.get('/slug/:slug', categoryController.findBySlug);
  router.get('/', categoryController.findAll);

  router.use(passportBearer);
  router.use(defineAbility);

  // protected routers
  router.get('/:id', categoryController.findById);
  router.post('/', categoryController.create);
  router.put('/:id', categoryController.update);
  router.delete('/:id', categoryController.delete);

  return router;
};
