module.exports = (sequelize, dataTypes) => {
  const Member = sequelize.define(
    'Member',
    {
      memberId: {
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
