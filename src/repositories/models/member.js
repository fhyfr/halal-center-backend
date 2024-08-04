module.exports = (sequelize, dataTypes) => {
  const Member = sequelize.define(
    'Member',
    {
      userId: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull: false,
      },
      provinceId: {
        type: dataTypes.INTEGER,
        references: { model: 'provinces', key: 'id' },
        allowNull: true,
      },
      cityId: {
        type: dataTypes.INTEGER,
        references: { model: 'cities', key: 'id' },
        allowNull: true,
      },
      fullName: {
        type: dataTypes.STRING,
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
      dateOfBirth: {
        type: 'TIMESTAMPTZ',
      },
      education: {
        type: dataTypes.STRING,
      },
      workExperience: {
        type: dataTypes.INTEGER,
      },
      facebook: {
        type: dataTypes.STRING,
      },
      linkedin: {
        type: dataTypes.STRING,
      },
    },
    {
      tableName: 'members',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Member.associate = (models) => {
    Member.belongsTo(models.User, { foreignKey: 'userId' });
    Member.belongsTo(models.Province, { foreignKey: 'provinceId' });
    Member.belongsTo(models.City, { foreignKey: 'cityId' });
  };

  return Member;
};
