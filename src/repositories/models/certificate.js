const { certificate } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Certificate = sequelize.define(
    'Certificate',
    {
      certificateId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      courseId: {
        type: dataTypes.STRING,
        references: { model: 'courses', key: 'course_id' },
        allowNull: false,
      },
      userId: {
        type: dataTypes.STRING,
        references: { model: 'users', key: 'user_id' },
        allowNull: false,
      },
      instructorId: {
        type: dataTypes.STRING,
        references: { model: 'instructors', key: 'instructor_id' },
        allowNull: false,
      },
      url: {
        type: dataTypes.STRING,
      },
      type: {
        type: dataTypes.ENUM,
        values: certificate.type,
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
      tableName: 'certificates',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Certificate.associate = (models) => {
    Certificate.belongsTo(models.Course, { foreignKey: 'courseId' });
    Certificate.belongsTo(models.User, { foreignKey: 'userId' });
    Certificate.belongsTo(models.Instructor, { foreignKey: 'instructorId' });
  };

  return Certificate;
};
