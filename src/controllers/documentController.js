const { document: documentMessage } = require('../helpers/responseMessage');

class DocumentController {
  constructor(documentUsecase, validator) {
    this.documentUsecase = documentUsecase;
    this.validator = validator;

    this.findById = this.findById.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findById(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const document = await this.documentUsecase.findById(
        req.ability,
        req.params.id,
      );

      return res.respond(document);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllDocumentsPayload(req.query);

      const documents = await this.documentUsecase.findAll(req);

      return res.respond(documents);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const document = await this.documentUsecase.create(req);

      return res.respond(
        { message: documentMessage.create, data: document },
        201,
      );
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.documentUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({ message: documentMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = DocumentController;
