const InvariantError = require('../exceptions/invariantError');
const { upload: uploadMessage } = require('../helpers/responseMessage');
const { formatBytes } = require('../helpers/conversion');

const { MAX_IMAGE_SIZE_IN_BYTES } = process.env;

class UploadController {
  constructor(uploadUsecase) {
    this.uploadUsecase = uploadUsecase;

    this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  async handleImageUpload(req, res, next) {
    try {
      if (!req.file) throw new Error(uploadMessage.image.failed);

      if (req.file.size > MAX_IMAGE_SIZE_IN_BYTES) {
        throw new InvariantError(
          `${uploadMessage.sizeTooLarge}, max is ${formatBytes(
            MAX_IMAGE_SIZE_IN_BYTES,
          )}`,
        );
      }

      const resultUpload = await this.uploadUsecase.uploadFile(req.file);

      const resultGenerate = await this.uploadUsecase.generatePublicUrl(
        resultUpload.fileId,
      );

      res.respond({
        message: uploadMessage.image.success,
        data: {
          imageUrl: resultGenerate.webViewLink,
          imageLocation: resultGenerate.webContentLink,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = UploadController;
