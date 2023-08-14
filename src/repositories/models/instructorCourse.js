module.exports = (sequelize, dataTypes) => {
  // instructors_courses is junction table of instructor and course
  // can't use many to many relationship with sequelize
  // because there is issue on underscored feature
  // ref: https://github.com/sequelize/sequelize/issues/11417

  const InstructorCourse = sequelize.define(
    'InstructorCourse',
    {
      instructorId: {
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
      tableName: 'instructors_courses',
      timestamps: true,
      underscored: false,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  InstructorCourse.associate = (models) => {
    InstructorCourse.belongsTo(models.Instructor, {
      foreignKey: 'instructorId',
    });
    InstructorCourse.belongsTo(models.Course, { foreignKey: 'courseId' });
  };

  return InstructorCourse;
};
