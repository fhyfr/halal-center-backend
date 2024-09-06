const request = require('request');
const InvariantError = require('../exceptions/invariantError');
const { upload: uploadMessage } = require('../helpers/responseMessage');
const { formatBytes } = require('../helpers/conversion');
const { upload } = require('../helpers/constant');

const { MAX_IMAGE_SIZE_IN_BYTES, MAX_DOCUMENT_SIZE_IN_BYTES } = process.env;

class UploadController {
  constructor(uploadUsecase, validator) {
    this.uploadUsecase = uploadUsecase;
    this.validator = validator;

    this.handleImageUpload = this.handleImageUpload.bind(this);
    this.handleDocumentUpload = this.handleDocumentUpload.bind(this);
    this.handleProxyImage = this.handleProxyImage.bind(this);
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

      const resultUpload = await this.uploadUsecase.uploadFile(
        req.file,
        upload.type.IMAGE,
      );

      const resultGenerate = await this.uploadUsecase.generatePublicUrl(
        resultUpload.fileId,
      );

      res.respond({
        message: uploadMessage.image.success,
        data: {
          imagePreview: resultGenerate.webPreviewLink,
          imageUrl: resultGenerate.webViewLink,
          imageLocation: resultGenerate.webContentLink,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async handleDocumentUpload(req, res, next) {
    try {
      if (!req.file) throw new Error(uploadMessage.document.failed);

      if (req.file.size > MAX_DOCUMENT_SIZE_IN_BYTES) {
        throw new InvariantError(
          `${uploadMessage.sizeTooLarge}, max is ${formatBytes(
            MAX_DOCUMENT_SIZE_IN_BYTES,
          )}`,
        );
      }

      const resultUpload = await this.uploadUsecase.uploadFile(
        req.file,
        upload.type.DOCUMENT,
      );

      const resultGenerate = await this.uploadUsecase.generatePublicUrl(
        resultUpload.fileId,
      );

      res.respond({
        message: uploadMessage.document.success,
        data: {
          documentUrl: resultGenerate.webViewLink,
          documentLocation: resultGenerate.webContentLink,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async handleProxyImage(req, res, next) {
    try {
      this.validator.validateProxyImagePayload(req.query);

      const { imageUrl } = req.query;

      // Set headers to inform the browser of the content type
      // Adjust MIME type as needed
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Type', 'image/jpeg');

      // Pipe the request to the provided image URL
      request(imageUrl)
        .on('error', (error) => {
          // Handle request error
          next(error);
        })
        .pipe(res);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = UploadController;
