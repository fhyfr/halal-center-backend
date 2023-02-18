module.exports = (sequelize, dataTypes) => {
  // user_courses is junction table of user and course
  // can't use many to many relationship with sequelize
  // because there is issue on underscored feature
  // ref: https://github.com/sequelize/sequelize/issues/11417

  const UserCourse = sequelize.define(
    'UserCourse',
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
      tableName: 'user_courses',
      timestamps: true,
      underscored: false,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  UserCourse.associate = (models) => {
    UserCourse.belongsTo(models.User, { foreignKey: 'userId' });
    UserCourse.belongsTo(models.Course, { foreignKey: 'courseId' });
  };

  return UserCourse;
};
