/* eslint-disable import/no-extraneous-dependencies */
const multer = require('multer');

module.exports = function fileUploadRouter(
  express,
  uploadController,
  passportBearer,
) {
  const router = express.Router();
  const upload = multer();

  router.use(passportBearer);

  router.post('/image', upload.single(), uploadController.handleImageUpload);
  router.post(
    '/document',
    upload.single(),
    uploadController.handleDocumentUpload,
  );

  return router;
};
