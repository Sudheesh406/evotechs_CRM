'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('leads', 'amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('leads', 'amount');
  }
};
