const { nanoid } = require('nanoid');
const Models = require('./models');
const logger = require('../helpers/logger');

class CategoryRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.categoryModel = Models.Category;
  }

  async findByCategoryId(categoryId) {
    const cacheKey = this.constructor.cacheKeyByCategoryId(categoryId);

    try {
      const category = await this.cacheService.get(cacheKey);

      return JSON.parse(category);
    } catch (error) {
      const category = await this.categoryModel.findOne({
        where: { categoryId },
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
        attributes: ['categoryId'],
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
          (categoryIds.rows, (category) => category.categoryId),
        ),
      };
    }

    const categoryIds = await this.categoryModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['categoryId'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: categoryIds.count,
      rows: categoryIds.rows.map(
        (categoryIds.rows, (category) => category.categoryId),
      ),
    };
  }

  async create(category) {
    Object.assign(category, { categoryId: `category-${nanoid(16)}` });

    const result = await this.categoryModel.create(category);

    if (result === null) {
      logger.error('create category failed');
      throw new Error('create category failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByCategoryId(result.categoryId);
    const cacheKeySlug = this.constructor.cacheKeyBySlug(result.slug);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    await this.cacheService.set(cacheKeySlug, JSON.stringify(result));

    return result.dataValues;
  }

  async update(category, oldSlug) {
    const result = await this.categoryModel.update(category, {
      where: { categoryId: category.categoryId },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('update category failed');
    }

    const cacheKeys = [
      this.constructor.cacheKeyByCategoryId(result[1][0].categoryId),
      this.constructor.cacheKeyBySlug(oldSlug),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async deleteByCategoryId(categoryId, slug, userId) {
    const result = await this.categoryModel.destroy({ where: { categoryId } });

    await this.categoryModel.update(
      { deletedBy: userId },
      {
        where: { categoryId },
        paranoid: false,
      },
    );

    const cacheKeys = [
      this.constructor.cacheKeyByCategoryId(categoryId),
      this.constructor.cacheKeyBySlug(slug),
    ];
    await this.cacheService.delete(cacheKeys);

    return result;
  }

  static cacheKeyByCategoryId(categoryId) {
    return `category:${categoryId}`;
  }

  static cacheKeyBySlug(slug) {
    return `category:slug:${slug}`;
  }
}

module.exports = CategoryRepository;
