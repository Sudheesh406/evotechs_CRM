const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel");
const task = require("../../v1/Project/task"); // assuming you have a tasks model

const documents = sequelize.define(
  "documents",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: task,
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    requirements: {
      type: DataTypes.JSON, // store array of strings
      allowNull: true,
      defaultValue: [],
      validate: {
        isArrayOfStrings(value) {
          if (!Array.isArray(value)) {
            throw new Error("Requirements must be an array");
          }
          if (!value.every((v) => typeof v === "string")) {
            throw new Error("Each requirement must be a string");
          }
        },
      },
    },
  },
  {
    tableName: "documents",
    timestamps: true,
  }
);

module.exports = documents;
