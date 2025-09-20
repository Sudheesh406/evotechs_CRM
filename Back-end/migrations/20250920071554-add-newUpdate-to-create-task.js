'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task', 'newUpdate', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false, // optional, but good to ensure non-null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task', 'newUpdate');
  }
};
