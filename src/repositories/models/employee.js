const { employee } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Employee = sequelize.define(
    'Employee',
    {
      employeeId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      positionId: {
        type: dataTypes.STRING,
        references: { model: 'positions', key: 'position_id' },
        allowNull: false,
      },
      departmentId: {
        type: dataTypes.STRING,
        references: { model: 'departments', key: 'department_id' },
        allowNull: false,
      },
      provinceId: {
        type: dataTypes.STRING,
        references: { model: 'provinces', key: 'province_id' },
        allowNull: false,
      },
      cityId: {
        type: dataTypes.STRING,
        references: { model: 'cities', key: 'city_id' },
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
    Employee.belongsTo(models.Province, { foreignKey: 'provinceId' });
    Employee.belongsTo(models.City, { foreignKey: 'cityId' });
  };

  return Employee;
};
