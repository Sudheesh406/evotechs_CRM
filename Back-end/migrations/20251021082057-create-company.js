"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("company", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      industryType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      businessType: {
        type: Sequelize.ENUM(
          "Private Limited",
          "Public Limited",
          "Partnership",
          "Sole Proprietorship",
          "LLP",
          "Other"
        ),
        allowNull: true,
        defaultValue: "Private Limited",
      },
      gstNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      panNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      registrationNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // 🔹 Contact Info
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      alternatePhone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // 🔹 Address
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pincode: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // 🔹 Company Insights
      employeeCount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      annualRevenue: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      foundedYear: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      // 🔹 Social Links
      linkedin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      facebook: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      instagram: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // 🔹 Status
      status: {
        type: Sequelize.ENUM("active", "inactive", "prospect", "closed"),
        allowNull: true,
        defaultValue: "active",
      },
      softDelete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("company");
  },
};
