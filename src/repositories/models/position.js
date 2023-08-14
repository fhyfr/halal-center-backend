module.exports = (sequelize, dataTypes) => {
  const Position = sequelize.define(
    'Position',
    {
      positionId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      positionName: {
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
      tableName: 'positions',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  return Position;
};
