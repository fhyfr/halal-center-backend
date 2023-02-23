module.exports = function promotionRouter(
  express,
  promotionController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', promotionController.findById);
  router.get('/', promotionController.findAll);
  router.post('/', promotionController.create);
  router.post('/resend/:id', promotionController.resend);
  router.delete('/:id', promotionController.delete);

  return router;
};
