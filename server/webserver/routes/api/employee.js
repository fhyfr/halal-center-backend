module.exports = function employeeRouter(
  express,
  employeeController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:employeeId', employeeController.findByEmployeeId);
  router.get('/', employeeController.findAll);
  router.post('/', employeeController.create);
  router.put('/:employeeId', employeeController.update);
  router.put('/mutation/:employeeId', employeeController.mutation);
  router.delete('/:employeeId', employeeController.delete);

  return router;
};
