/* eslint-disable strict */

'use strict';

const { encryptPassword } = require('../../../../src/helpers/encryption');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      // Super Admin
      {
        user_id: 'user-1',
        role_id: 'role-1',
        username: 'super_admin',
        email: 'super.admin@halal.co.id',
        password: await encryptPassword('superadminhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Admin Course
      {
        user_id: 'user-2',
        role_id: 'role-2',
        username: 'admin_course',
        email: 'admin.course@halal.co.id',
        password: await encryptPassword('admincoursehalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Member
      {
        user_id: 'user-3',
        role_id: 'role-3',
        username: 'firman_member',
        email: 'firman.member@halal.co.id',
        password: await encryptPassword('firmanmemberhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Treasure
      {
        user_id: 'user-4',
        role_id: 'role-4',
        username: 'treasure',
        email: 'treasure@halal.co.id',
        password: await encryptPassword('treasurehalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Director
      {
        user_id: 'user-5',
        role_id: 'role-5',
        username: 'director',
        email: 'director@halal.co.id',
        password: await encryptPassword('directorhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Vice Director
      {
        user_id: 'user-6',
        role_id: 'role-6',
        username: 'vice_director',
        email: 'vice.director@halal.co.id',
        password: await encryptPassword('vicedirectorhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Instructor
      {
        user_id: 'user-7',
        role_id: 'role-7',
        username: 'instructor',
        email: 'instructor@halal.co.id',
        password: await encryptPassword('instructorhalalcenter'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    await queryInterface.bulkInsert('users', users);

    await queryInterface.bulkInsert('members', [
      {
        member_id: 'member-1',
        user_id: 'user-3',
        full_name: 'Member Halal Center',
        province_id: 'province-1',
        city_id: 'city-4',
        address: 'Jl. Solo No.26 RT.003/RW.03',
        phone_number: '+6281385505555',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    return queryInterface.bulkInsert('instructors', [
      {
        instructor_id: 'instructor-1',
        user_id: 'user-7',
        province_id: 'province-1',
        city_id: 'city-5',
        full_name: 'Instructor Halal Center',
        address: 'Jl. Pahlawan No.30 RT.010/RW.01',
        phone_number: '+628345678910',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  },
};
