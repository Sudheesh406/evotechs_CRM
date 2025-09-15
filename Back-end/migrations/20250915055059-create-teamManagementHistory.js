'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('team_management_history', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      staffId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'signup', // table name for signup model
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', 
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      teamName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      softDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('team_management_history');
  },
};
