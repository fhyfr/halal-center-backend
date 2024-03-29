const { employee } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Employee = sequelize.define(
    'Employee',
    {
      positionId: {
        type: dataTypes.INTEGER,
        references: { model: 'positions', key: 'id' },
        allowNull: false,
      },
      departmentId: {
        type: dataTypes.INTEGER,
        references: { model: 'departments', key: 'id' },
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
      gender: {
        type: dataTypes.ENUM,
        values: employee.gender,
        allowNull: false,
      },
      joinDate: {
        type: 'TIMESTAMPTZ',
        allowNull: false,
      },
      salary: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    Employee.belongsTo(models.Position, { foreignKey: 'positionId' });
    Employee.belongsTo(models.Department, { foreignKey: 'departmentId' });
  };

  return Employee;
};
