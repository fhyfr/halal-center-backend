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
  router.get('/:id', courseController.findById);
  router.get('/instructor/:id', courseController.findAllCoursesOfInstructor);

  router.post('/', courseController.create);
  router.post('/register/:courseId', courseController.register);
  router.put('/:id', courseController.update);
  router.delete('/:id', courseController.delete);

  return router;
};
