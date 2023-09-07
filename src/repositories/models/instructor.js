module.exports = (sequelize, dataTypes) => {
  const Instructor = sequelize.define(
    'Instructor',
    {
      userId: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull: false,
      },
      provinceId: {
        type: dataTypes.INTEGER,
        references: { model: 'provinces', key: 'id' },
        allowNull: false,
      },
      cityId: {
        type: dataTypes.INTEGER,
        references: { model: 'cities', key: 'id' },
        allowNull: false,
      },
      fullName: {
        type: dataTypes.TEXT,
      },
      profilePicture: {
        type: dataTypes.TEXT,
      },
      address: {
        type: dataTypes.TEXT,
      },
      phoneNumber: {
        type: dataTypes.STRING,
      },
      facebook: {
        type: dataTypes.STRING,
      },
      linkedin: {
        type: dataTypes.STRING,
      },
      createdBy: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull: true,
      },
      updatedBy: {
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
      tableName: 'instructors',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Instructor.associate = (models) => {
    Instructor.belongsTo(models.User, { foreignKey: 'userId' });
    Instructor.belongsTo(models.Province, { foreignKey: 'provinceId' });
    Instructor.belongsTo(models.City, { foreignKey: 'cityId' });
    Instructor.hasMany(models.Mentor, { foreignKey: 'instructorId' });
  };

  return Instructor;
};
