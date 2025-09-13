'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('team', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      teamName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      teamDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      staffIds: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      leaderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'signup', // ensure this matches your actual staff table name in DB
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAdminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'signup', // ensure this matches your actual staff table name in DB
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', 
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('team');
  },
};
