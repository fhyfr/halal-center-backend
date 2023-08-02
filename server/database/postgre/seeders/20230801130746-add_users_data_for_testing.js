/* eslint-disable strict */

'use strict';

const { encryptPassword } = require('../../../../src/helpers/encryption');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      // Super Admin
      {
        role_id: 1,
        username: 'super_admin',
        email: 'super.admin@halal.co.id',
        password: await encryptPassword('superadminhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Admin Course
      {
        role_id: 2,
        username: 'admin_course',
        email: 'admin.course@halal.co.id',
        password: await encryptPassword('admincoursehalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Member
      {
        role_id: 3,
        username: 'firman_member',
        email: 'firman.member@halal.co.id',
        password: await encryptPassword('firmanmemberhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Staff HRD
      {
        role_id: 4,
        username: 'staff_hrd',
        email: 'staff.hrd@halal.co.id',
        password: await encryptPassword('staffhrdhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Treasure
      {
        role_id: 5,
        username: 'treasure',
        email: 'treasure@halal.co.id',
        password: await encryptPassword('treasurehalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Director
      {
        role_id: 6,
        username: 'director',
        email: 'director@halal.co.id',
        password: await encryptPassword('directorhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Vice Director
      {
        role_id: 7,
        username: 'vice_director',
        email: 'vice.director@halal.co.id',
        password: await encryptPassword('vicedirectorhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return queryInterface.bulkInsert('users', users);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  },
};
