module.exports = function fileUploadRouter(
  express,
  uploadController,
  passportBearer,
  multer,
) {
  const router = express.Router();
  const upload = multer();

  router.use(passportBearer);

  router.post(
    '/image',
    upload.single('image'),
    uploadController.handleImageUpload,
  );
  router.post(
    '/document',
    upload.single('document'),
    uploadController.handleDocumentUpload,
  );

  return router;
};
