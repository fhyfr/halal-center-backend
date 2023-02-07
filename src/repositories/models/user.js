module.exports = (sequelize, dataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: dataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      password: {
        type: dataTypes.TEXT,
        allowNull: false,
      },
      roleId: {
        type: dataTypes.INTEGER,
        allowNull: false,
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
