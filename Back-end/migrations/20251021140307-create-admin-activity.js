'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AdminActivity', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      taskName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      priority: {
        type: Sequelize.ENUM('Low', 'Medium', 'High', 'Critical'),
        allowNull: false,
        defaultValue: 'Medium',
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // --- Relations ---
       adminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'signup', // make sure this matches your signup table name in DB
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
       requirementId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'requirement', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      // --- Metadata ---
      status: {
        type: Sequelize.ENUM('Not Started', 'In Progress', 'Final Stage', 'Completed'),
        allowNull: false,
        defaultValue: 'Not Started',
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
    await queryInterface.dropTable('AdminActivity');
  },
};
