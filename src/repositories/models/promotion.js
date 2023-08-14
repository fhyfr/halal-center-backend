const { promotion } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Promotion = sequelize.define(
    'Promotion',
    {
      promotionId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      courseIds: {
        type: dataTypes.ARRAY(dataTypes.STRING),
        allowNull: true,
      },
      receiverId: {
        type: dataTypes.STRING,
        references: { model: 'users', key: 'user_id' },
        allowNull: true,
      },
      subject: {
        type: dataTypes.TEXT,
      },
      type: {
        type: dataTypes.ENUM,
        values: promotion.type,
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
