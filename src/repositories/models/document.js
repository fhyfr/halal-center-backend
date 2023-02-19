const { document: documentEnum } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Document = sequelize.define(
    'Document',
    {
      courseId: {
        type: dataTypes.INTEGER,
        references: { model: 'courses', key: 'id' },
        allowNull: false,
      },
      userId: {
        type: dataTypes.INTEGER,
        references: { model: 'users', key: 'id' },
      },
      url: {
        type: dataTypes.STRING,
      },
      type: {
        type: dataTypes.ENUM,
        values: documentEnum.type,
      },
    },
    {
      tableName: 'documents',
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
    {
      hooks: {},
      instanceMethods: {},
    },
  );

  Document.associate = (models) => {
    Document.belongsTo(models.Course, { foreignKey: 'courseId' });
    Document.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Document;
};
