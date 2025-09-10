'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task', 'finishBy', {
      type: Sequelize.DATEONLY, 
      allowNull: true,        
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task', 'finishBy');
  }
};
