const { payment } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const RegistrationPayment = sequelize.define(
    'RegistrationPayment',
    {
      registrationId: {
        type: dataTypes.INTEGER,
        references: { model: 'registrations', key: 'id' },
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
      as: 'registration',
    });
  };

  return RegistrationPayment;
};
