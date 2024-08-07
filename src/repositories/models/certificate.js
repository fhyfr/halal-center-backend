const { certificate } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Certificate = sequelize.define(
    'Certificate',
    {
      courseId: {
        type: dataTypes.INTEGER,
        references: { model: 'courses', key: 'id' },
        allowNull: false,
      },
      userId: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
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
