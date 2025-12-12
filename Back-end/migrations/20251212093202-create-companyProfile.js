"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("companyProfile", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "signup", // 👈 table name of signup model
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "company", // 👈 table name for company model
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      imagePath: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("companyProfile");
  },
};
