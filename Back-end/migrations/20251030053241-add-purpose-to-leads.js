'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('leads', 'purpose', {
      type: Sequelize.STRING,
      allowNull: false, // you can make it false if required
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('leads', 'purpose');
  },
};
