'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('subTasks', 'role', {
      type: Sequelize.ENUM('admin', 'staff'),
      allowNull: false,
      defaultValue: 'staff',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('subTasks', 'role');
  },
};
