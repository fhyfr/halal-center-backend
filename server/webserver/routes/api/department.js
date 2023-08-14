module.exports = function departmentRouter(
  express,
  departmentController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:departmentId', departmentController.findByDepartmentId);
  router.get('/', departmentController.findAll);
  router.post('/', departmentController.create);
  router.put('/:departmentId', departmentController.update);
  router.delete('/:departmentId', departmentController.delete);

  return router;
};
