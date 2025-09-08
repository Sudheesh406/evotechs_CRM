"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("calls", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      staffId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "signup", 
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      contactId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "contacts", // 👈 make sure this matches your actual signup/auth table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
       softDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
       status: {
        type: Sequelize.ENUM("pending", "completed", "cancelled"),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("calls");
  },
};
