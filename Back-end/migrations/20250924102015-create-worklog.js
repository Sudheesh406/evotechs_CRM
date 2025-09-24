'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('worklog', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      staffId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'signup', // Make sure this matches the actual table name of authModel
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      taskName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comment: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      softDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('worklog');
  },
};
