const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel");
const contacts = require("../Customer/contacts");

const task = sequelize.define(
  "task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    requirement: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: signup,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: contacts,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stage: {
      type: DataTypes.ENUM("1", "2", "3","4"),
      allowNull: false,
      defaultValue: "1", 
    },
      priority: {
        type: DataTypes.ENUM("High", "Normal", "Low"),
        defaultValue: "Normal",
        allowNull: false,
    },
      finishBy: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "task",
    timestamps: true,
  }
);

module.exports = task;
