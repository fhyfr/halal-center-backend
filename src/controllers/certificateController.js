const InvariantError = require('../exceptions/invariantError');
const { formatBytes } = require('../helpers/conversion');
const {
  certificate: certificateMessage,
  upload: uploadMessage,
} = require('../helpers/responseMessage');

const { MAX_DOCUMENT_SIZE_IN_BYTES } = process.env;

class CertificateController {
  constructor(certificateUsecase, validator) {
    this.certificateUsecase = certificateUsecase;
    this.validator = validator;

    this.findByCertificateId = this.findByCertificateId.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.delete = this.delete.bind(this);
    this.importCertificates = this.importCertificates.bind(this);
  }

  async findByCertificateId(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const certificate = await this.certificateUsecase.findByCertificateId(
        req.ability,
        req.params.id,
      );

      return res.respond(certificate);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllCertificatesPayload(req.query);

      const certificates = await this.certificateUsecase.findAll(req);

      return res.respond(certificates);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const certificate = await this.certificateUsecase.create(req);

      return res.respond(
        { message: certificateMessage.create, data: certificate },
        201,
      );
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.certificateUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({ message: certificateMessage.delete });
    } catch (error) {
      return next(error);
    }
  }

  async importCertificates(req, res, next) {
    try {
      if (!req.file) throw new Error(certificateMessage.importFailed);

      if (req.file.size > MAX_DOCUMENT_SIZE_IN_BYTES) {
        throw new InvariantError(
          `${uploadMessage.sizeTooLarge}, max is ${formatBytes(
            MAX_DOCUMENT_SIZE_IN_BYTES,
          )}`,
        );
      }

      const result = await this.certificateUsecase.importCertificates(
        req.ability,
        req.file,
        req.user.id,
      );

      return res.respond({
        message: certificateMessage.importSuccess,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = CertificateController;
