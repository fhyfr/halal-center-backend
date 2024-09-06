module.exports = function fileUploadRouter(
  express,
  uploadController,
  passportBearer,
  multer,
) {
  const router = express.Router();
  const upload = multer();

  // open routers
  router.get('/proxy-image', uploadController.handleProxyImage);

  router.use(passportBearer);

  // protected routers
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
