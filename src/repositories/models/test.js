const { test } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Test = sequelize.define(
    'Test',
    {
      courseId: {
        type: dataTypes.INTEGER,
        references: { model: 'courses', key: 'id' },
        allowNull: false,
      },
      type: {
        type: dataTypes.ENUM,
        values: test.type,
      },
      url: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      startDate: {
        type: 'TIMESTAMPTZ',
        allowNull: false,
      },
      endDate: {
        type: 'TIMESTAMPTZ',
        allowNull: false,
      },
      active: {
        type: dataTypes.BOOLEAN,
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
      tableName: 'tests',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Test.associate = (models) => {
    Test.belongsTo(models.Course, { foreignKey: 'courseId' });
    Test.hasMany(models.Score, { foreignKey: 'testId' });
  };

  return Test;
};
