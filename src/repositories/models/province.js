module.exports = (sequelize, dataTypes) => {
  const Province = sequelize.define(
    'Province',
    {
      provinceId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: dataTypes.TEXT,
      },
    },
    {
      tableName: 'provinces',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  return Province;
};
