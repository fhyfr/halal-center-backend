module.exports = (sequelize, dataTypes) => {
  const Session = sequelize.define(
    'Session',
    {
      sessionId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      accessToken: {
        type: dataTypes.STRING,
      },
      accessTokenExpiresAt: {
        type: dataTypes.DATE,
      },
      refreshToken: {
        type: dataTypes.STRING,
      },
      refreshTokenExpiresAt: {
        type: dataTypes.DATE,
      },
      userId: {
        type: dataTypes.STRING,
        references: { model: 'users', key: 'user_id' },
        allowNull: false,
      },
    },
    {
      tableName: 'sessions',
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Session.associate = (models) => {
    Session.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Session;
};
