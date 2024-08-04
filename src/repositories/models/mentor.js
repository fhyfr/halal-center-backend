module.exports = (sequelize, dataTypes) => {
  // mentors is junction table of instructor and course
  // can't use many to many relationship with sequelize
  // because there is issue on underscored feature
  // ref: https://github.com/sequelize/sequelize/issues/11417

  const Mentor = sequelize.define(
    'Mentor',
    {
      instructorId: {
        type: dataTypes.INTEGER,
        references: {
          model: 'instructors',
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
      tableName: 'mentors',
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Mentor.associate = (models) => {
    Mentor.belongsTo(models.Instructor, {
      foreignKey: 'instructorId',
      as: 'instructor',
    });
    Mentor.belongsTo(models.Course, { foreignKey: 'courseId' });
  };

  return Mentor;
};
