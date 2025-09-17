const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel");
const contacts = require("../Customer/contacts");

const calls = sequelize.define(
  "calls",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: signup,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: contacts,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
      TeamStaffId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: signup,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9]+$/, // only numbers
        len: [7, 15], // min 7 digits, max 15
      },
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "calls",
    timestamps: true,
  }
);

module.exports = calls;
