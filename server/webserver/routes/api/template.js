module.exports = function templateRouter(
  express,
  templateController,
  passportBearer,
  defineAbility,
) {
  const router = express.Router();

  router.use(passportBearer);
  router.use(defineAbility);

  router.get(
    '/certificate/:courseId',
    templateController.getCertificateTemplateByCourseId,
  );
  router.get('/score/:testId', templateController.getScoreTemplateByTestId);

  return router;
};
