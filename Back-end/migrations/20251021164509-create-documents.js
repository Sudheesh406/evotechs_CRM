'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      staffId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'signup', // Make sure this is the exact table name of signup
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'task', // Make sure this matches your task table name
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      TeamStaffId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'signup',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      softDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('documents');
  },
};
