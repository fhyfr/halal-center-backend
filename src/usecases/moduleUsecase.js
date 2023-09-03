const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const {
  module: moduleMessage,
  course: courseMessage,
} = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class ModuleUsecase {
  constructor(moduleRepo, courseRepo) {
    this.moduleRepo = moduleRepo;
    this.courseRepo = courseRepo;
  }

  async findByModuleId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Module');

    const module = await this.moduleRepo.findByModuleId(id);
    if (module === null) {
      throw new NotFoundError(moduleMessage.notFound);
    }

    return this.constructor.resolveModuleData(module);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Module');

    const { page, size, courseId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.moduleRepo.findAll(offset, limit, courseId);

    const dataRows = {
      count: ids.count,
      rows: await this.resolveModules(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Module');

    // validate course
    const isCourseExist = await this.courseRepo.findById(req.body.courseId);
    if (!isCourseExist) {
      throw new InvariantError(courseMessage.notFound);
    }

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const result = await this.moduleRepo.create(req.body);

    return this.constructor.resolveModuleData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Module');

    const module = await this.moduleRepo.findByModuleId(id);
    if (module === null) {
      throw new NotFoundError(moduleMessage.notFound);
    }

    return this.moduleRepo.deleteByModuleId(id, userId);
  }

  async resolveModules(ids) {
    const modules = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const module = await this.moduleRepo.findByModuleId(nextID);
      if (module == null) {
        logger.error(`${moduleMessage.null} ${nextID}`);
      } else {
        modules.push(this.constructor.resolveModuleData(module));
      }
    }, Promise.resolve());

    return modules;
  }

  static resolveModuleData(module) {
    const { deletedAt, deletedBy, updatedAt, updatedBy, ...moduleData } =
      module;

    return moduleData;
  }
}

module.exports = ModuleUsecase;
