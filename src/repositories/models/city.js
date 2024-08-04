module.exports = (sequelize, dataTypes) => {
  const City = sequelize.define(
    'City',
    {
      provinceId: {
        type: dataTypes.INTEGER,
        references: { model: 'provinces', key: 'id' },
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
