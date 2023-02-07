/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt');
const { role } = require('../../helpers/constant');

module.exports = (sequelize, dataTypes) => {
  const Role = sequelize.define(
    'Role',
    {
      roleName: {
        type: dataTypes.ENUM,
        values: role.name,
        allowNull: false,
      },
      roleToken: {
        type: dataTypes.TEXT,
      },
    },
    {
      tableName: 'roles',
      underscored: true,
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['roleName'],
        },
      ],
    },
    {
      hooks: {
        beforeCreate: (data) => {
          const salt = bcrypt.genSaltSync();
          data.roleToken = bcrypt.hashSync(data.roleName, salt);
        },
      },
      instanceMethods: {
        generateHash(name) {
          return bcrypt.hashSync(name, bcrypt.genSaltSync(8), null);
        },
      },
    },
  );

  return Role;
};
