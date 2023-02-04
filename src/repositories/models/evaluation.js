module.exports = (sequelize, dataTypes) => {
  const Evaluation = sequelize.define(
    'Evaluation',
    {
      employeeId: {
        type: dataTypes.INTEGER,
        references: { model: 'employees', key: 'id' },
        allowNull: false,
      },
      document: {
        type: dataTypes.STRING,
      },
      score: {
        type: dataTypes.INTEGER,
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
