const { module: moduleEnum } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Module = sequelize.define(
    'Module',
    {
      courseId: {
        type: dataTypes.INTEGER,
        references: { model: 'courses', key: 'id' },
        allowNull: false,
      },
      document: {
        type: dataTypes.STRING,
      },
      type: {
        type: dataTypes.ENUM,
        values: moduleEnum.type,
      },
    },
    {
      tableName: 'modules',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Module.associate = (models) => {
    Module.belongsTo(models.Course, { foreignKey: 'courseId' });
  };

  return Module;
};
