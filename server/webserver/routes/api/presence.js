module.exports = function presenceRouter(
  express,
  presenceController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/', presenceController.findAll);
  router.get('/:id', presenceController.findByPresenceId);

  router.post('/', presenceController.create);
  router.delete('/:id', presenceController.delete);

  return router;
};
