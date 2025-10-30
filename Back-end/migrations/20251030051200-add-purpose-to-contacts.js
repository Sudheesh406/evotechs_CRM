'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contacts', 'purpose', {
      type: Sequelize.STRING,
      allowNull: false, // you can make it false if required
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contacts', 'purpose');
  },
};
