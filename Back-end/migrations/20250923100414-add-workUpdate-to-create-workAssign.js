'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // add the new ENUM column to the table
    await queryInterface.addColumn('workAssign', 'workUpdate', {
      type: Sequelize.ENUM('Pending', 'Progress', 'Completed'),
      allowNull: false,
      defaultValue: 'Pending'
    });
  },

  async down(queryInterface, Sequelize) {
    // remove the column
    await queryInterface.removeColumn('workAssign', 'workUpdate');
    // no need to drop enum type manually in MySQL
  }
};
