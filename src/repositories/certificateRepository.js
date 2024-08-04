const Models = require('./models');
const logger = require('../helpers/logger');

class CertificateRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.certificateModel = Models.Certificate;
  }

  async findByCertificateId(id) {
    const cacheKey = this.constructor.cacheKeyByCertificateId(id);

    try {
      const certificate = await this.cacheService.get(cacheKey);

      return JSON.parse(certificate);
    } catch (error) {
      const certificate = await this.certificateModel.findOne({
        where: { id },
        raw: true,
      });

      if (certificate === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(certificate));

      return certificate;
    }
  }

  async findAll(offset, limit, courseId, userId, instructorId, type) {
    const whereConditions = {};

    if (courseId && courseId > 0) {
      Object.assign(whereConditions, { courseId });
    }

    if (userId && userId > 0) {
      Object.assign(whereConditions, { userId });
    }

    if (instructorId && instructorId > 0) {
      Object.assign(whereConditions, { instructorId });
    }

    if (type && type !== '') {
      Object.assign(whereConditions, { type });
    }

    const certificateIds = await this.certificateModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    return {
      count: certificateIds.count,
      rows: certificateIds.rows.map(
        (certificateIds.rows, (certificate) => certificate.id),
      ),
    };
  }

  async create(certificate) {
    const result = await this.certificateModel.create(certificate);

    if (result === null) {
      logger.error('create certificate failed');
      throw new Error('create certificate failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByCertificateId(result.id);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async deleteByCertificateId(id, userId) {
    const result = await this.certificateModel.destroy({
      where: { id },
    });

    await this.certificateModel.update(
      { deletedBy: userId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyByCertificateId(id);

    await this.cacheService.delete(cacheKey);
    return result;
  }

  static cacheKeyByCertificateId(id) {
    return `certificate:${id}`;
  }
}

module.exports = CertificateRepository;
