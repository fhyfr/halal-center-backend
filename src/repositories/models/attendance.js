module.exports = (sequelize, dataTypes) => {
  const Attendance = sequelize.define(
    'Attendance',
    {
      courseId: {
        type: dataTypes.INTEGER,
        references: { model: 'courses', key: 'id' },
        allowNull: false,
      },
      title: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      endDate: {
        type: 'TIMESTAMPTZ',
        allowNull: false,
      },
      active: {
        type: dataTypes.BOOLEAN,
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
      tableName: 'attendances',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Course, { foreignKey: 'courseId' });
    Attendance.hasMany(models.Presence, { foreignKey: 'attendanceId' });
  };

  return Attendance;
};
