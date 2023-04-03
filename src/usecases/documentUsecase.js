const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  document: documentMessage,
  course: courseMessage,
  user: userMessage,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class DocumentUsecase {
  constructor(documentRepo, courseRepo, userRepo) {
    this.documentRepo = documentRepo;
    this.courseRepo = courseRepo;
    this.userRepo = userRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Document');

    const document = await this.documentRepo.findById(id);

    if (document === null) {
      throw new NotFoundError(documentMessage.notFound);
    }

    return this.constructor.resolveDocumentData(document);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Document');

    const { page, size, courseId, userId, type } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.documentRepo.findAll(
      offset,
      limit,
      courseId,
      userId,
      type,
    );

    const dataRows = {
      count: ids.count,
      rows: await this.resolveDocuments(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Document');

    // validate course
    const isCourseExist = await this.courseRepo.findById(req.body.courseId);
    if (!isCourseExist) {
      throw new InvariantError(courseMessage.notFound);
    }

    if (req.body.type === 'CERTIFICATE' && !req.body.userId) {
      throw new InvariantError('userId is required');
    }

    // validate user
    if (!req.body.userId) {
      Object.assign(req.body, {
        userId: req.user.id,
      });
    }

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const isUserExist = await this.userRepo.findById(req.body.userId);
    if (!isUserExist) {
      throw new InvariantError(userMessage.notFound);
    }

    const result = await this.documentRepo.create(req.body);

    return this.constructor.resolveDocumentData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Document');

    const document = await this.documentRepo.findById(id);
    if (document === null) {
      throw new NotFoundError(documentMessage.notFound);
    }

    return this.documentRepo.deleteById(id, userId);
  }

  async resolveDocuments(ids) {
    const documents = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const document = await this.documentRepo.findById(nextID);

      if (document == null) {
        logger.error(`${documentMessage.null} ${nextID}`);
      } else {
        documents.push(this.constructor.resolveDocumentData(document));
      }
    }, Promise.resolve());

    return documents;
  }

  static resolveDocumentData(document) {
    const { deletedAt, deletedBy, updatedAt, updatedBy, ...documentData } =
      document;

    return documentData;
  }
}

module.exports = DocumentUsecase;
