module.exports = (sequelize, dataTypes) => {
  // registrations is junction table of user and course
  // can't use many to many relationship with sequelize
  // because there is issue on underscored feature
  // ref: https://github.com/sequelize/sequelize/issues/11417

  const Registration = sequelize.define(
    'Registration',
    {
      registrationId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      userId: {
        type: dataTypes.STRING,
        references: {
          model: 'users',
          key: 'user_id',
        },
        allowNull: false,
      },
      courseId: {
        type: dataTypes.STRING,
        references: {
          model: 'courses',
          key: 'course_id',
        },
        allowNull: false,
      },
    },
    {
      tableName: 'registrations',
      timestamps: true,
      underscored: true,
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
