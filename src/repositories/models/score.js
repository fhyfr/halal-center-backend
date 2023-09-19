module.exports = (sequelize, dataTypes) => {
  const Score = sequelize.define(
    'Score',
    {
      testId: {
        type: dataTypes.INTEGER,
        references: { model: 'tests', key: 'id' },
        allowNull: false,
      },
      registrationId: {
        type: dataTypes.INTEGER,
        references: { model: 'registrations', key: 'id' },
        allowNull: false,
      },
      score: {
        type: dataTypes.INTEGER,
        allowNull: false,
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
      tableName: 'scores',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Score.associate = (models) => {
    Score.belongsTo(models.Test, { foreignKey: 'testId' });
    Score.belongsTo(models.Registration, { foreignKey: 'registrationId' });
  };

  return Score;
};
