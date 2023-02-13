module.exports = (sequelize, dataTypes) => {
  const Member = sequelize.define(
    'Member',
    {
      userId: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
        allowNull: false,
      },
      fullName: {
        type: dataTypes.STRING,
      },
      profilePicture: {
        type: dataTypes.TEXT,
      },
      address: {
        type: dataTypes.TEXT,
      },
      phoneNumber: {
        type: dataTypes.STRING,
      },
      facebook: {
        type: dataTypes.STRING,
      },
      linkedin: {
        type: dataTypes.STRING,
      },
    },
    {
      tableName: 'members',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Member.associate = (models) => {
    Member.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Member;
};
