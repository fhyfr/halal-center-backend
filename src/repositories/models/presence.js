module.exports = (sequelize, dataTypes) => {
  const Presence = sequelize.define(
    'Presence',
    {
      attendanceId: {
        type: dataTypes.INTEGER,
        references: { model: 'attendances', key: 'id' },
        allowNull: false,
      },
      registrationId: {
        type: dataTypes.INTEGER,
        references: { model: 'registrations', key: 'id' },
        allowNull: false,
      },
      summary: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
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
      tableName: 'presences',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Presence.associate = (models) => {
    Presence.belongsTo(models.Attendance, { foreignKey: 'attendanceId' });
    Presence.belongsTo(models.Registration, { foreignKey: 'registrationId' });
  };

  return Presence;
};
