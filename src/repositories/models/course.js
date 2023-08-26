const { course } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Course = sequelize.define(
    'Course',
    {
      categoryId: {
        type: dataTypes.INTEGER,
        references: { model: 'categories', key: 'id' },
        allowNull: false,
      },
      batchNumber: {
        type: dataTypes.INTEGER,
      },
      title: {
        type: dataTypes.TEXT,
      },
      subTitle: {
        type: dataTypes.TEXT,
      },
      descriptions: {
        type: dataTypes.TEXT,
      },
      type: {
        type: dataTypes.ENUM,
        values: course.type,
      },
      price: {
        type: dataTypes.INTEGER,
      },
      level: {
        type: dataTypes.ENUM,
        values: course.level,
      },
      banner: {
        type: dataTypes.STRING,
      },
      quota: {
        type: dataTypes.INTEGER,
      },
      totalRegistered: {
        type: dataTypes.INTEGER,
        defaultValue: 0,
      },
      startDate: {
        type: 'TIMESTAMPTZ',
        allowNull: false,
      },
      endDate: {
        type: 'TIMESTAMPTZ',
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
      tableName: 'courses',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Course.associate = (models) => {
    Course.belongsTo(models.Category, { foreignKey: 'categoryId' });
    Course.hasMany(models.Registration, { foreignKey: 'courseId' });
  };

  return Course;
};
