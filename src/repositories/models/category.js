module.exports = (sequelize, dataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      categoryName: {
        type: dataTypes.STRING,
      },
      slug: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull: true,
      },
      updatedBy: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull: true,
      },
      deletedBy: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
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
