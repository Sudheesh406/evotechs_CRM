const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel");
const contacts = require("../Customer/contacts");

const company = sequelize.define(
  "company",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    industryType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    businessType: {
      type: DataTypes.ENUM("Private Limited", "Public Limited", "Partnership", "Sole Proprietorship", "LLP", "Other"),
      allowNull: true,
      defaultValue: "Private Limited",
    },
    gstNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    panNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // 🔹 Contact Information
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alternatePhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // 🔹 Address Details
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 🔹 Company Insights
    employeeCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    annualRevenue: {
      type: DataTypes.STRING, // e.g., "10-50 Cr", "1-5 Cr"
      allowNull: true,
    },
    foundedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // 🔹 Social & Extra
    linkedin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // 🔹 Status & Metadata
    status: {
      type: DataTypes.ENUM("active", "inactive", "prospect", "closed"),
      allowNull: true,
      defaultValue: "active",
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "company",
    timestamps: true,
  }
);

module.exports = company;
