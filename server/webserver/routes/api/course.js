module.exports = function courseRouter(
  express,
  courseController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/', courseController.findAll);
  router.get('/:courseId', courseController.findByCourseId);
  router.post('/', courseController.create);
  router.post('/register/:courseId', courseController.register);
  router.put('/:courseId', courseController.update);
  router.delete('/:courseId', courseController.delete);

  return router;
};
