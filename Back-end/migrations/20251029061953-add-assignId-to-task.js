'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task', 'assignId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'workAssign', // ✅ table name (not model name)
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task', 'assignId');
  },
};
