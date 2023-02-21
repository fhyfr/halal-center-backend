const Models = require('./models');
const logger = require('../helpers/logger');

class DocumentRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.documentModel = Models.Document;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const document = await this.cacheService.get(cacheKey);

      return JSON.parse(document);
    } catch (error) {
      const document = await this.documentModel.findOne({
        where: { id },
        raw: true,
      });

      if (document === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(document));

      return document;
    }
  }

  async findAll(offset, limit, courseId, userId) {
    const whereConditions = {};

    if (courseId && courseId > 0) {
      Object.assign(whereConditions, { courseId });
    }

    if (userId && userId > 0) {
      Object.assign(whereConditions, { userId });
    }

    const documentIds = await this.documentModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    return {
      count: documentIds.count,
      rows: documentIds.rows.map((documentIds.rows, (document) => document.id)),
    };
  }

  async create(document) {
    const result = await this.documentModel.create(document);

    if (result === null) {
      logger.error('create document failed');
      throw new Error('create document failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async deleteById(id, userId) {
    const result = await this.documentModel.destroy({ where: { id } });

    await this.documentModel.update(
      { deletedBy: userId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyById(id);

    await this.cacheService.delete(cacheKey);
    return result;
  }

  static cacheKeyById(id) {
    return `document:${id}`;
  }
}

module.exports = DocumentRepository;
