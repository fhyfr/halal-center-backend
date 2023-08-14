module.exports = (sequelize, dataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      categoryId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      categoryName: {
        type: dataTypes.STRING,
      },
      slug: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
        type: dataTypes.STRING,
        references: { model: 'users', key: 'user_id' },
        allowNull: true,
      },
      updatedBy: {
        type: dataTypes.STRING,
        references: { model: 'users', key: 'user_id' },
        allowNull: true,
      },
      deletedBy: {
        type: dataTypes.STRING,
        references: { model: 'users', key: 'user_id' },
        allowNull: true,
      },
    },
    {
      tableName: 'categories',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  return Category;
};
