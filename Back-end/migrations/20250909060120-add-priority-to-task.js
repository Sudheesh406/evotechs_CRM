'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task', 'priority', {
      type: Sequelize.ENUM('High', 'Normal', 'Low'),
      allowNull: false,
      defaultValue: 'Normal',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task', 'priority');
  }
};
