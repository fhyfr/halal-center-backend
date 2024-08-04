/* eslint-disable no-unused-vars */
/* eslint-disable strict */

'use strict';

const { encryptPassword } = require('../../../../src/helpers/encryption');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      // Super Admin
      {
        id: 1,
        role_id: 1,
        username: 'super_admin',
        email: 'super.admin@halal.co.id',
        password: await encryptPassword('superadminhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Admin Course
      {
        id: 2,
        role_id: 2,
        username: 'admin_course',
        email: 'admin.course@halal.co.id',
        password: await encryptPassword('admincoursehalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Member
      {
        id: 3,
        role_id: 3,
        username: 'firman_member',
        email: 'firman.member@halal.co.id',
        password: await encryptPassword('firmanmemberhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Treasure
      {
        id: 4,
        role_id: 4,
        username: 'treasure',
        email: 'treasure@halal.co.id',
        password: await encryptPassword('treasurehalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Director
      {
        id: 5,
        role_id: 5,
        username: 'director',
        email: 'director@halal.co.id',
        password: await encryptPassword('directorhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    await queryInterface.bulkInsert('users', users);

    return queryInterface.bulkInsert('members', [
      {
        id: 1,
        user_id: 3,
        full_name: 'Member Halal Center',
        province_id: 1,
        city_id: 4,
        address: 'Jl. Solo No.26 RT.003/RW.03, Tangerang Selatan, Banten',
        phone_number: '+6281385505555',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  },
};
