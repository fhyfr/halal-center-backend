module.exports = (sequelize, dataTypes) => {
  const Instructor = sequelize.define(
    'Instructor',
    {
      courseIds: {
        type: dataTypes.ARRAY(dataTypes.INTEGER),
      },
      email: {
        type: dataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      fullName: {
        type: dataTypes.TEXT,
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
      tableName: 'instructors',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  return Instructor;
};
