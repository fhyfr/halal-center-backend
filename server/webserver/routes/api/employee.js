module.exports = function employeeRouter(
  express,
  employeeController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', employeeController.findById);
  router.get('/', employeeController.findAll);
  router.post('/', employeeController.create);
  router.put('/:id', employeeController.update);
  router.put('/mutation/:id', employeeController.mutation);
  router.delete('/:id', employeeController.delete);

  return router;
};
