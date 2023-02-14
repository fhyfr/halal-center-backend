const Models = require('./models');
const logger = require('../helpers/logger');

class CategoryRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.categoryModel = Models.Category;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const category = await this.cacheService.get(cacheKey);

      return JSON.parse(category);
    } catch (error) {
      const category = await this.categoryModel.findOne({
        where: { id },
        raw: true,
      });

      if (category === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(category));

      return category;
    }
  }

  async findBySlug(slug) {
    const cacheKey = this.constructor.cacheKeyBySlug(slug);

    try {
      const category = await this.cacheService.get(cacheKey);

      return JSON.parse(category);
    } catch (error) {
      const category = await this.categoryModel.findOne({
        where: { slug },
        raw: true,
      });

      if (category === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(category));

      return category;
    }
  }

  async findAll(offset, limit, query) {
    if (query && query !== '') {
      const categoryIds = await this.categoryModel.findAndCountAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id'],
        where: {
          categoryName: {
            [Models.Sequelize.Op.iLike]: `%${query}%`,
          },
        },
        limit,
        offset,
        raw: true,
      });

      return {
        count: categoryIds.count,
        rows: categoryIds.rows.map(
          (categoryIds.rows, (category) => category.id),
        ),
      };
    }

    const categoryIds = await this.categoryModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: categoryIds.count,
      rows: categoryIds.rows.map((categoryIds.rows, (category) => category.id)),
    };
  }

  async create(category) {
    const result = await this.categoryModel.create(category);

    if (result == null) {
      logger.error('create category failed');
      throw new Error('create category failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result);
    const cacheKeySlug = this.constructor.cacheKeyBySlug(result);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    await this.cacheService.set(cacheKeySlug, JSON.stringify(result));

    return result.dataValues;
  }

  async update(category, oldSlug) {
    const result = await this.categoryModel.update(category, {
      where: { id: category.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('failed update category');
    }

    const cacheKeys = [
      this.constructor.cacheKeyById(result[1][0].id),
      this.constructor.cacheKeyBySlug(oldSlug),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async deleteById(id, slug, userId) {
    const result = await this.categoryModel.destroy({ where: { id } });

    await this.categoryModel.update(
      { deletedBy: userId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKeys = [
      this.constructor.cacheKeyById(id),
      this.constructor.cacheKeyBySlug(slug),
    ];
    await this.cacheService.delete(cacheKeys);

    return result;
  }

  static cacheKeyById(id) {
    return `category:${id}`;
  }

  static cacheKeyBySlug(slug) {
    return `category:slug:${slug}`;
  }
}

module.exports = CategoryRepository;
