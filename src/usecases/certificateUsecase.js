const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  certificate: certificateMessage,
  course: courseMessage,
  user: userMessage,
  instructor: instructorMessage,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class CertificateUsecase {
  constructor(cerficateRepo, courseRepo, userRepo, instructorRepo) {
    this.cerficateRepo = cerficateRepo;
    this.courseRepo = courseRepo;
    this.userRepo = userRepo;
    this.instructorRepo = instructorRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Certificate');

    const certificate = await this.cerficateRepo.findById(id);
    if (certificate === null) {
      throw new NotFoundError(certificateMessage.notFound);
    }

    return this.constructor.resolveCertificateData(certificate);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Certificate');

    const { page, size, courseId, userId, instructorId, type } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.cerficateRepo.findAll(
      offset,
      limit,
      courseId,
      userId,
      instructorId,
      type,
    );

    const dataRows = {
      count: ids.count,
      rows: await this.resolveCertificates(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Certificate');

    // validate course
    const isCourseExist = await this.courseRepo.findById(req.body.courseId);
    if (!isCourseExist) {
      throw new InvariantError(courseMessage.notFound);
    }

    if (req.body.type === 'CERTIFICATE_MEMBER' && !req.body.userId) {
      throw new InvariantError('userId is required');
    }

    if (req.body.type === 'CERTIFICATE_INSTRUCTOR' && !req.body.instructorId) {
      throw new InvariantError('instructorId is required');
    }

    // assign userId as creator if userId is empty
    if (!req.body.userId) {
      Object.assign(req.body, {
        userId: req.user.id,
      });
    }

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    if (req.body.userId && req.body.userId !== null) {
      const isUserExist = await this.userRepo.findById(req.body.userId);
      if (!isUserExist) {
        throw new InvariantError(userMessage.notFound);
      }
    }

    if (req.body.instructorId && req.body.instructorId !== null) {
      const isInstructorExist = await this.userRepo.findById(req.body.userId);
      if (!isInstructorExist) {
        throw new InvariantError(instructorMessage.notFound);
      }
    }

    const result = await this.cerficateRepo.create(req.body);
    return this.constructor.resolveCertificateData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Certificate');

    const certificate = await this.cerficateRepo.findById(id);
    if (certificate === null) {
      throw new NotFoundError(certificateMessage.notFound);
    }

    return this.cerficateRepo.deleteById(id, userId);
  }

  async resolveCertificates(ids) {
    const certificates = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const certificate = await this.cerficateRepo.findById(nextID);

      if (certificate == null) {
        logger.error(`${certificateMessage.null} ${nextID}`);
      } else {
        certificates.push(this.constructor.resolveCertificateData(certificate));
      }
    }, Promise.resolve());

    return certificates;
  }

  static resolveCertificateData(certificate) {
    const { deletedAt, deletedBy, updatedAt, updatedBy, ...certificateData } =
      certificate;

    return certificateData;
  }
}

module.exports = CertificateUsecase;
