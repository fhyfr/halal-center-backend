module.exports = (sequelize, dataTypes) => {
  const Module = sequelize.define(
    'Module',
    {
      moduleId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      courseId: {
        type: dataTypes.STRING,
        references: { model: 'courses', key: 'course_id' },
        allowNull: false,
      },
      url: {
        type: dataTypes.STRING,
      },
      createdBy: {
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
