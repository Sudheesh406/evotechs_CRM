'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contacts', 'location', {
      type: Sequelize.STRING,
      allowNull: true, // you can make it false if required
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contacts', 'location');
  },
};
