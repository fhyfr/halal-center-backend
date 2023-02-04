module.exports = (sequelize, dataTypes) => {
  const Employee = sequelize.define(
    'Employee',
    {
      userId: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull: false,
      },
      positionId: {
        type: dataTypes.INTEGER,
        references: { model: 'positions', key: 'id' },
        allowNull: false,
      },
      nik: {
        type: dataTypes.STRING,
      },
      fullName: {
        type: dataTypes.TEXT,
      },
      address: {
        type: dataTypes.TEXT,
      },
      phoneNumber: {
        type: dataTypes.STRING,
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
      tableName: 'employees',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Employee.associate = (models) => {
    Employee.belongsTo(models.User, { foreignKey: 'userId' });
    Employee.belongsTo(models.Position, { foreignKey: 'positionId' });
  };

  return Employee;
};
