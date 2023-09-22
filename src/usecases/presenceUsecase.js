const { ForbiddenError } = require('@casl/ability');

const NotFoundError = require('../exceptions/notFoundError');
const {
  presence: presenceMessage,
  attendance: attendanceMessage,
} = require('../helpers/responseMessage');
const logger = require('../helpers/logger');
const { getPagination, getPagingData } = require('../helpers/pagination');

class PresenceUsecase {
  constructor(presenceRepo, attendanceRepo, registrationRepo) {
    this.presenceRepo = presenceRepo;
    this.attendanceRepo = attendanceRepo;
    this.registrationRepo = registrationRepo;
  }

  async findByPresenceId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Presence');

    const presence = await this.presenceRepo.findByPresenceId(id);
    if (presence === null) {
      throw new NotFoundError(presenceMessage.notFound);
    }

    return this.resolvePresenceData(presence);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Presence');

    let ids;
    let registration;
    let registrationId = null;

    const { page, size, attendanceId, userId } = req.query;
    const { limit, offset } = getPagination(page, size);

    if (userId && userId > 0) {
      registration = await this.registrationRepo.findByUserId(userId);
      if (registration === null) {
        ids = {
          count: 0,
          rows: [],
        };
      } else {
        registrationId = registration.id;

        ids = await this.presenceRepo.findAll(
          offset,
          limit,
          attendanceId,
          registrationId,
        );
      }
    } else {
      ids = await this.presenceRepo.findAll(
        offset,
        limit,
        attendanceId,
        registrationId,
      );
    }

    const dataRows = {
      count: ids.count,
      rows: await this.resolvePresences(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Presence');

    // validate attendance
    const isAttendanceExist = await this.attendanceRepo.findByAttendanceId(
      req.body.attendanceId,
    );
    if (!isAttendanceExist || isAttendanceExist === null) {
      throw new NotFoundError(attendanceMessage.notFound);
    }

    // validate registration
    const isRegistrationExist = await this.registrationRepo.findByUserId(
      req.body.userId,
    );
    if (!isRegistrationExist || isRegistrationExist === null) {
      throw new NotFoundError(
        `${presenceMessage.registrationNotFound} ${req.body.userId}`,
      );
    }

    // validate unique presence
    const isPresenceExist =
      await this.presenceRepo.findByAttendanceIdAndRegistrationId(
        req.body.attendanceId,
        isRegistrationExist.id,
      );
    if (isPresenceExist && isPresenceExist !== null) {
      throw new NotFoundError(
        `${presenceMessage.alreadyExist} ${req.body.userId}`,
      );
    }

    delete req.body.userId;
    Object.assign(req.body, {
      registrationId: isRegistrationExist.id,
      createdBy: req.user.id,
    });

    const result = await this.presenceRepo.create(req.body);
    return this.resolvePresenceData(result);
  }

  async delete(ability, id, deleterId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Presence');

    // validate presence
    const existingPresence = await this.presenceRepo.findByPresenceId(id);
    if (!existingPresence || existingPresence === null) {
      throw new NotFoundError(presenceMessage.notFound);
    }

    return this.presenceRepo.deleteById(id, deleterId);
  }

  async resolvePresences(ids) {
    const presences = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const presence = await this.presenceRepo.findByPresenceId(nextID);

      if (presence == null) {
        logger.error(`${presenceMessage.null} ${nextID}`);
      } else {
        presences.push(await this.resolvePresenceData(presence));
      }
    }, Promise.resolve());

    return presences;
  }

  async resolvePresenceData(presence) {
    const registration = await this.registrationRepo.findByRegistrationId(
      presence.registrationId,
    );

    return {
      id: presence.id,
      attendanceId: presence.attendanceId,
      summary: presence.summary,
      registration: {
        id: registration.id,
        userId: registration.userId,
        courseId: registration.courseId,
      },
      createdBy: presence.createdBy,
      createdAt: presence.createdAt,
    };
  }
}

module.exports = PresenceUsecase;
