'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('leaves', 'endDate', {
      type: Sequelize.DATEONLY,
      allowNull: true, // or false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('leaves', 'endDate');
  }
};
