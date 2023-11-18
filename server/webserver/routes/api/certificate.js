const InvariantError = require('../../../../src/exceptions/invariantError');

module.exports = function certificateRoute(
  express,
  certificateController,
  passportBearer,
  defineAbility,
  multer,
) {
  const router = express.Router();

  // Define storage and file filter
  const storage = multer.memoryStorage(); // Store files in memory
  const fileFilter = (req, file, cb) => {
    // Check if the file has an Excel file extension
    const allowedExtensions = ['.xlsx', '.xls', '.csv', '.xlsb'];
    const fileExtension = (file.originalname || '')
      .toLowerCase()
      .match(/\.[0-9a-z]+$/);

    if (fileExtension && allowedExtensions.includes(fileExtension[0])) {
      cb(null, true); // Accept the file
    } else {
      cb(
        new InvariantError('invalid file format, please upload an Excel file'),
        false,
      );
    }
  };

  // Create multer instance with storage and file filter
  const upload = multer({ storage, fileFilter });

  router.use(passportBearer);
  router.use(defineAbility);

  router.get('/:id', certificateController.findByCertificateId);
  router.get('/', certificateController.findAll);

  router.post('/', certificateController.create);
  router.delete('/:id', certificateController.delete);
  router.post(
    '/import',
    upload.single('certificates'),
    certificateController.importCertificates,
  );

  return router;
};
