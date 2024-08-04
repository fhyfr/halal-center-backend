module.exports = (sequelize, dataTypes) => {
  const Module = sequelize.define(
    'Module',
    {
      courseId: {
        type: dataTypes.INTEGER,
        references: { model: 'courses', key: 'id' },
        allowNull: false,
      },
      url: {
        type: dataTypes.STRING,
      },
      createdBy: {
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
