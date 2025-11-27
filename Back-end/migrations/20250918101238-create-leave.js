'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('leaves', {
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
          model: 'signup', // make sure this matches your signup table name
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      leaveType: {
        type: Sequelize.ENUM('morning', 'afternoon', 'fullday'),
        allowNull: false,
      },
      leaveDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      description: {
       type: Sequelize.ENUM('Personal', 'Family', 'Medical', 'Emergency'),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Approve', 'Reject'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      category: {
        type: Sequelize.ENUM('Leave', 'WFH'),
        allowNull: false,
        defaultValue: 'Leave',
      },
      HalfTime: {
        type: Sequelize.ENUM('Offline', 'Leave'),
        allowNull: true,
      },
      softDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAdminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'signup', // same as above
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('leaves');
  },
};
