module.exports = (sequelize, dataTypes) => {
  const Session = sequelize.define(
    'Session',
    {
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
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
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
