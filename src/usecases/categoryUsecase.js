const slugify = require('slugify');
const { ForbiddenError } = require('@casl/ability');
const NotFoundError = require('../exceptions/notFoundError');
const { category: categoryMessage } = require('../helpers/responseMessage');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const InvariantError = require('../exceptions/invariantError');

class CategoryUsecase {
  constructor(categoryRepo, courseRepo) {
    this.categoryRepo = categoryRepo;
    this.courseRepo = courseRepo;
  }

  async findById(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Category');

    const category = await this.categoryRepo.findById(id);

    if (category === null) {
      throw new NotFoundError(categoryMessage.notFound);
    }

    const { deletedAt, deletedBy, ...categoryData } = category;

    return categoryData;
  }

  async findBySlug(slug) {
    const category = await this.categoryRepo.findBySlug(slug);

    if (category === null) {
      throw new NotFoundError(categoryMessage.notFound);
    }

    return this.constructor.resolvePublicCategoryData(category);
  }

  async findAll(req) {
    const { page, size, query } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.categoryRepo.findAll(offset, limit, query);

    const dataRows = {
      count: ids.count,
      rows: await this.resolveCategories(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async create(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('create', 'Category');

    // generate slug
    const slug = slugify(req.body.categoryName, {
      lower: true,
      strict: true,
    });

    const existingCategory = await this.categoryRepo.findBySlug(slug);

    if (existingCategory) {
      throw new InvariantError(categoryMessage.exist);
    }

    Object.assign(req.body, {
      slug,
      createdBy: req.user.id,
    });

    const result = await this.categoryRepo.create(req.body);

    const { deletedAt, deletedBy, ...newCategory } = result;
    return newCategory;
  }

  async update(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('update', 'Category');

    const existingCategory = await this.categoryRepo.findById(req.params.id);
    if (!existingCategory) {
      throw new NotFoundError(categoryMessage.notFound);
    }

    // generate slug
    const newSlug = slugify(req.body.categoryName, {
      lower: true,
      strict: true,
    });

    const isCategoryNameExist = await this.categoryRepo.findBySlug(newSlug);

    if (isCategoryNameExist) {
      if (isCategoryNameExist.id.toString() !== req.params.id.toString()) {
        throw new InvariantError(categoryMessage.exist);
      }
    }

    Object.assign(req.body, {
      id: req.params.id,
      slug: newSlug,
      updatedBy: req.user.id,
    });

    const result = await this.categoryRepo.update(
      req.body,
      existingCategory.slug,
    );

    const { deletedAt, deletedBy, ...newCategory } = result;
    return newCategory;
  }

  async delete(ability, id, userId) {
    ForbiddenError.from(ability).throwUnlessCan('delete', 'Category');

    const category = await this.categoryRepo.findById(id);
    if (category === null) {
      throw new NotFoundError(categoryMessage.notFound);
    }

    const totalCourses = await this.courseRepo.countCourseByCategoryId(id);
    if (totalCourses > 0) {
      throw new InvariantError(categoryMessage.notEmpty);
    }

    return this.categoryRepo.deleteById(id, category.slug, userId);
  }

  async resolveCategories(ids) {
    const categories = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const category = await this.categoryRepo.findById(nextID);

      if (category == null) {
        logger.error(`${categoryMessage.null} ${nextID}`);
      } else {
        categories.push(this.constructor.resolvePublicCategoryData(category));
      }
    }, Promise.resolve());

    return categories;
  }

  static resolvePublicCategoryData(category) {
    const {
      deletedAt,
      deletedBy,
      updatedBy,
      createdBy,
      ...publicCategoryData
    } = category;

    return publicCategoryData;
  }
}

module.exports = CategoryUsecase;
