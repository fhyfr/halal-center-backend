module.exports = (sequelize, dataTypes) => {
  const Instructor = sequelize.define(
    'Instructor',
    {
      instructorId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      userId: {
        type: dataTypes.STRING,
        references: { model: 'users', key: 'user_id' },
        allowNull: false,
      },
      provinceId: {
        type: dataTypes.STRING,
        references: { model: 'provinces', key: 'province_id' },
        allowNull: false,
      },
      cityId: {
        type: dataTypes.STRING,
        references: { model: 'cities', key: 'city_id' },
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
        type: dataTypes.STRING,
        references: { model: 'users', key: 'user_id' },
        allowNull: true,
      },
      updatedBy: {
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
  };

  return Instructor;
};
