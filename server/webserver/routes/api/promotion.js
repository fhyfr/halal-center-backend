module.exports = function promotionRouter(
  express,
  promotionController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:promotionId', promotionController.findByPromotionId);
  router.get('/', promotionController.findAll);
  router.post('/', promotionController.create);
  router.post('/resend/:promotionId', promotionController.resend);
  router.delete('/:promotionId', promotionController.delete);

  return router;
};
