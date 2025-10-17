'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'signup', // adjust table name if needed
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'signup',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sendingDate: {
        type: Sequelize.DATEONLY, // stores only date (YYYY-MM-DD)
        allowNull: false,
      },
      sendingTime: {
        type: Sequelize.TIME, // stores only time (HH:MM:SS)
        allowNull: false,
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'team',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      softDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  },
};
