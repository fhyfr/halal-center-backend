module.exports = function promotionRouter(
  express,
  promotionController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.post('/', promotionController.create);
  router.post('/:id', promotionController.resend);
  router.delete('/:id', promotionController.delete);
};
