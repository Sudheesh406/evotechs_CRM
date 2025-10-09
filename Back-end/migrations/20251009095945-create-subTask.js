'use strict';


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subTasks', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notChecked: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      checked: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      staffId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'signup', // Make sure this matches the table name of your signup model
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'task', // Make sure this matches the table name of your task model
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subTasks');
  },
};
