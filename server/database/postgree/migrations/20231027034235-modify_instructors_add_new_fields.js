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
      queryInterface.addColumn('instructors', 'date_of_birth', {
        type: 'TIMESTAMPTZ',
      }),
      queryInterface.addColumn('instructors', 'education', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('instructors', 'work_experience', {
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
      queryInterface.removeColumn('instructors', 'date_of_birth'),
      queryInterface.removeColumn('instructors', 'education'),
      queryInterface.removeColumn('instructors', 'work_experience'),
    ]);
  },
};
