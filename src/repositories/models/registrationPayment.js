const { payment } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const RegistrationPayment = sequelize.define(
    'RegistrationPayment',
    {
      registrationPaymentId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      registrationId: {
        type: dataTypes.STRING,
        references: { model: 'registrations', key: 'registration_id' },
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
      tableName: 'registration_payments',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  RegistrationPayment.associate = (models) => {
    RegistrationPayment.belongsTo(models.Registration, {
      foreignKey: 'registrationId',
    });
  };

  return RegistrationPayment;
};
