const { promotion } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Promotion = sequelize.define(
    'Promotion',
    {
      courseIds: {
        type: dataTypes.ARRAY(dataTypes.INTEGER),
        allowNull: true,
      },
      receiverId: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull: true,
      },
      rawBody: {
        type: dataTypes.TEXT,
      },
      htmlBody: {
        type: dataTypes.TEXT,
      },
      type: {
        type: dataTypes.ENUM,
        values: promotion.type,
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
      tableName: 'promotions',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Promotion.associate = (models) => {
    Promotion.belongsTo(models.User, { foreignKey: 'receiverId' });
  };

  return Promotion;
};
