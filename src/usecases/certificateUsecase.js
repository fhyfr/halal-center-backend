const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  certificate: certificateMessage,
  course: courseMessage,
  member: memberMessage,
  instructor: instructorMessage,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class CertificateUsecase {
  constructor(cerficateRepo, courseRepo, memberRepo, instructorRepo) {
    this.cerficateRepo = cerficateRepo;
    this.courseRepo = courseRepo;
    this.memberRepo = memberRepo;
    this.instructorRepo = instructorRepo;
  }

  async findByCertificateId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Certificate');

    const certificate = await this.cerficateRepo.findByCertificateId(id);
    if (certificate === null) {
      throw new NotFoundError(certificateMessage.notFound);
    }

    return this.constructor.resolveCertificateData(certificate);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Certificate');

    const { page, size, courseId, userId, type } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.cerficateRepo.findAll(
      offset,
      limit,
      courseId,
      userId,
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

    // assign userId as creator if userId is empty
    if (!req.body.userId) {
      Object.assign(req.body, {
        userId: req.user.id,
      });
    }

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    let isMemberExist = false;
    let isInstructorExist = false;

    if (req.body.userId && req.body.userId !== null) {
      switch (req.body.type) {
        case 'CERTIFICATE_MEMBER':
          isMemberExist = await this.memberRepo.findByUserId(req.body.userId);
          if (!isMemberExist) {
            throw new InvariantError(memberMessage.notFound);
          }
          break;
        case 'CERTIFICATE_INSTRUCTOR':
          isInstructorExist = await this.instructorRepo.findByUserId(
            req.body.userId,
          );
          if (!isInstructorExist) {
            throw new InvariantError(instructorMessage.notFound);
          }
          break;
        default:
          break;
      }
    }

    const result = await this.cerficateRepo.create(req.body);
    return this.constructor.resolveCertificateData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Certificate');

    const certificate = await this.cerficateRepo.findByCertificateId(id);
    if (certificate === null) {
      throw new NotFoundError(certificateMessage.notFound);
    }

    return this.cerficateRepo.deleteByCertificateId(id, userId);
  }

  async resolveCertificates(ids) {
    const certificates = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const certificate = await this.cerficateRepo.findByCertificateId(nextID);

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
