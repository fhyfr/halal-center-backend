module.exports = (sequelize, dataTypes) => {
  const Department = sequelize.define(
    'Department',
    {
      departmentId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      departmentName: {
        type: dataTypes.STRING,
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
      tableName: 'departments',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  return Department;
};
