const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const { position: positionMessage } = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class PositionUsecase {
  constructor(positionRepo, employeeRepo) {
    this.positionRepo = positionRepo;
    this.employeeRepo = employeeRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Position');

    const position = await this.positionRepo.findById(id);

    if (position === null) {
      throw new NotFoundError(positionMessage.notFound);
    }

    return this.resolvePositionData(position);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Position');

    const { page, size, query } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.positionRepo.findAll(offset, limit, query);

    const dataRows = {
      count: ids.count,
      rows: await this.resolvePositions(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async isPositionNameExist(positionName) {
    const existingPosition = await this.positionRepo.findByPositionName(
      positionName.toLowerCase(),
    );

    return existingPosition !== null;
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Position');

    Object.assign(req.body, {
      createdBy: req.user.id,
    });

    const checkPositionName = await this.isPositionNameExist(
      req.body.positionName,
    );
    if (checkPositionName) {
      throw new InvariantError(positionMessage.exist);
    }

    const result = await this.positionRepo.create(req.body);

    return this.resolvePositionData(result);
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Position');

    const existingPosition = await this.positionRepo.findById(req.params.id);
    if (!existingPosition) {
      throw new NotFoundError(positionMessage.notFound);
    }

    const isPositionNameExist = await this.positionRepo.findByPositionName(
      req.body.positionName.toLowerCase(),
    );

    if (isPositionNameExist) {
      if (isPositionNameExist.id.toString() !== req.params.id.toString()) {
        throw new InvariantError(positionMessage.exist);
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      updatedBy: req.user.id,
    });

    const result = await this.positionRepo.update(req.body);

    return this.resolvePositionData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Position');

    const position = await this.positionRepo.findById(id);
    if (position === null) {
      throw new NotFoundError(positionMessage.notFound);
    }

    const totalEmployees = await this.employeeRepo.countByPositionId(id);
    if (totalEmployees > 0) {
      throw new InvariantError(positionMessage.notEmpty);
    }

    return this.positionRepo.deleteById(id, userId);
  }

  async resolvePositions(ids) {
    const positions = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const position = await this.positionRepo.findById(nextID);

      if (position == null) {
        logger.error(`${positionMessage.null} ${nextID}`);
      } else {
        positions.push(await this.resolvePositionData(position));
      }
    }, Promise.resolve());

    return positions;
  }

  async resolvePositionData(position) {
    const totalEmployees = await this.employeeRepo.countByPositionId(
      position.id,
    );
    Object.assign(position, { totalEmployees });

    const { deletedAt, deletedBy, ...positionData } = position;
    return positionData;
  }
}

module.exports = PositionUsecase;
