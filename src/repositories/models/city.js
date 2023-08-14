module.exports = (sequelize, dataTypes) => {
  const City = sequelize.define(
    'City',
    {
      cityId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      provinceId: {
        type: dataTypes.STRING,
        references: { model: 'provinces', key: 'province_id' },
        allowNull: false,
      },
      name: {
        type: dataTypes.TEXT,
      },
    },
    {
      tableName: 'cities',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  City.associate = (models) => {
    City.belongsTo(models.Province, { foreignKey: 'provinceId' });
  };

  return City;
};
