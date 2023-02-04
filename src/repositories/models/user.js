module.exports = (sequelize, dataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: {
        type: dataTypes.STRING,
      },
      email: {
        type: dataTypes.TEXT,
      },
      password: {
        type: dataTypes.TEXT,
      },
      roleId: {
        type: dataTypes.INTEGER,
      },
      updatedBy: {
        type: dataTypes.INTEGER,
      },
      deletedBy: {
        type: dataTypes.INTEGER,
      },
    },
    {
      tableName: 'users',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['username', 'email'],
        },
      ],
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  return User;
};
