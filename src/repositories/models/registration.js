module.exports = (sequelize, dataTypes) => {
  // registrations is junction table of user and course
  // can't use many to many relationship with sequelize
  // because there is issue on underscored feature
  // ref: https://github.com/sequelize/sequelize/issues/11417

  const Registration = sequelize.define(
    'Registration',
    {
      userId: {
        type: dataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },
      courseId: {
        type: dataTypes.INTEGER,
        references: {
          model: 'courses',
          key: 'id',
        },
        allowNull: false,
      },
    },
    {
      tableName: 'registrations',
      timestamps: true,
      underscored: false,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Registration.associate = (models) => {
    Registration.belongsTo(models.User, { foreignKey: 'userId' });
    Registration.belongsTo(models.Course, { foreignKey: 'courseId' });
  };

  return Registration;
};
