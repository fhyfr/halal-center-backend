module.exports = (sequelize, dataTypes) => {
  const User = sequelize.define(
    'User',
    {
      userId: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      roleId: {
        type: dataTypes.STRING,
        references: { model: 'roles', key: 'role_id' },
        allowNull: false,
      },
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
      otp: {
        type: dataTypes.INTEGER,
      },
      isOtpVerified: {
        type: dataTypes.BOOLEAN,
      },
      updatedBy: {
        type: dataTypes.STRING,
      },
      deletedBy: {
        type: dataTypes.STRING,
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

  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'roleId' });
  };

  return User;
};
