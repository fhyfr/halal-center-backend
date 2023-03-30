const { payment } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      courseId: {
        type: dataTypes.INTEGER,
        references: { model: 'courses', key: 'id' },
        allowNull: false,
      },
      userId: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull: true,
      },
      amount: {
        type: dataTypes.INTEGER,
        defaultValue: 0,
      },
      discount: {
        type: dataTypes.INTEGER,
        defaultValue: 0,
      },
      descriptions: {
        type: dataTypes.TEXT,
      },
      type: {
        type: dataTypes.ENUM,
        values: payment.type,
      },
      paymentMethod: {
        type: dataTypes.ENUM,
        values: payment.method,
      },
      transactionDate: {
        type: 'TIMESTAMPTZ',
        allowNull: false,
      },
      status: {
        type: dataTypes.ENUM,
        values: payment.status,
      },
      receiptUrl: {
        type: dataTypes.TEXT,
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
      tableName: 'payments',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Course, { foreignKey: 'courseId' });
    Payment.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Payment;
};
