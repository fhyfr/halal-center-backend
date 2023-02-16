module.exports = function departmentRouter(
  express,
  departmentController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', departmentController.findById);
  router.get('/', departmentController.findAll);
  router.post('/', departmentController.create);
  router.put('/:id', departmentController.update);
  router.delete('/:id', departmentController.delete);

  return router;
};
