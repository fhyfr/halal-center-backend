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
  router.get('/:categoryId', categoryController.findByCategoryId);
  router.post('/', categoryController.create);
  router.put('/:categoryId', categoryController.update);
  router.delete('/:categoryId', categoryController.delete);

  return router;
};
