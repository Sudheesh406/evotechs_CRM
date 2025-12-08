"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LeaveAndWFH", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      staffId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "signup", // table name of authModel
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      totalLeaves: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      totalWFH: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      softDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      createdAdminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "signup",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("LeaveAndWFH");
  },
};
