const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const { position: positionMessage } = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class PositionUsecase {
  constructor(positionRepo) {
    this.positionRepo = positionRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('findById', 'Position');

    const position = await this.positionRepo.findById(id);

    if (position === null) {
      throw new NotFoundError(positionMessage.notFound);
    }

    return this.constructor.resolvePositionData(position);
  }

  async findAll(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('findAll', 'Position');

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

    return this.constructor.resolvePositionData(result);
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

    return this.constructor.resolvePositionData(result);
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Position');

    const position = await this.positionRepo.findById(id);
    if (position === null) {
      throw new NotFoundError(positionMessage.notFound);
    }

    // TODO: check employees data inside position, is position empty or not

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
        positions.push(this.constructor.resolvePositionData(position));
      }
    }, Promise.resolve());

    return positions;
  }

  static resolvePositionData(position) {
    const { deletedAt, deletedBy, ...positionData } = position;

    return positionData;
  }
}

module.exports = PositionUsecase;
