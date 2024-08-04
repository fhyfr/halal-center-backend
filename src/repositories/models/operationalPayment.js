const { payment } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const OperationalPayment = sequelize.define(
    'OperationalPayment',
    {
      courseId: {
        type: dataTypes.INTEGER,
        references: { model: 'courses', key: 'id' },
        allowNull: false,
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
      tableName: 'operational_payments',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  OperationalPayment.associate = (models) => {
    OperationalPayment.belongsTo(models.Course, {
      foreignKey: 'courseId',
    });
  };

  return OperationalPayment;
};
