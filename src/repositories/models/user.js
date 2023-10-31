module.exports = (sequelize, dataTypes) => {
  const User = sequelize.define(
    'User',
    {
      roleId: {
        type: dataTypes.INTEGER,
        references: { model: 'roles', key: 'id' },
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

  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'roleId' });
    User.hasMany(models.Registration, { foreignKey: 'courseId' });
  };

  return User;
};
