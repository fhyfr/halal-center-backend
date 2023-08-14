module.exports = (sequelize, dataTypes) => {
  const Evaluation = sequelize.define(
    'Evaluation',
    {
      evaluationId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      employeeId: {
        type: dataTypes.STRING,
        references: { model: 'employees', key: 'employee_id' },
        allowNull: false,
      },
      document: {
        type: dataTypes.STRING,
      },
      score: {
        type: dataTypes.INTEGER,
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
      tableName: 'evaluations',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Evaluation.associate = (models) => {
    Evaluation.belongsTo(models.Employee, { foreignKey: 'employeeId' });
  };

  return Evaluation;
};
