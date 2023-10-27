'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.addColumn('members', 'date_of_birth', {
        type: 'TIMESTAMPTZ',
      }),
      queryInterface.addColumn('members', 'education', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('members', 'work_experience', {
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([
      queryInterface.removeColumn('members', 'date_of_birth'),
      queryInterface.removeColumn('members', 'education'),
      queryInterface.removeColumn('members', 'work_experience'),
    ]);
  },
};
