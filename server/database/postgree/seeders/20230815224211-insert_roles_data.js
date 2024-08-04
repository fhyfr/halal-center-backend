/* eslint-disable no-unused-vars */
/* eslint-disable strict */

'use strict';

const bcrypt = require('bcrypt');
const { role } = require('../../../../src/helpers/constant');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [];

    role.name.forEach((name, id) => {
      const salt = bcrypt.genSaltSync();
      const roleToken = bcrypt.hashSync(name, salt);

      const roleObject = {
        id: id + 1, // index is count from 0
        role_name: name,
        role_token: roleToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      roles.push(roleObject);
    });

    return queryInterface.bulkInsert('roles', roles);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('roles', null, {});
  },
};
