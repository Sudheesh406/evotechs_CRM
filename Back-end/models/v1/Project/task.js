const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel");
const contacts = require("../Customer/contacts");
const workAssign = require("../Work_space/workAssign")

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
      onDelete: "CASCADE",
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: contacts,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    teamWork: {
      type: DataTypes.JSON, // store array as JSON
      allowNull: true,
      defaultValue: [],
    },
    stage: {
      type: DataTypes.ENUM("1", "2", "3", "4"),
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
    rework: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reject: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    newUpdate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
     assignId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: workAssign,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "task",
    timestamps: true,
  }
);

module.exports = task;
