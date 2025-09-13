const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel"); // Staff table

const team = sequelize.define(
  "team",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    teamName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    teamDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    staffIds: {
      type: DataTypes.JSON, 
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayOfNumbers(value) {
          if (!Array.isArray(value)) {
            throw new Error("staffIds must be an array");
          }
          value.forEach((id) => {
            if (typeof id !== "number") {
              throw new Error("staffIds array must contain only numbers");
            }
          });
        },
      },
    },
    leaderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: signup,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    createdAdminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: signup,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "team",
    timestamps: true,
  }
);

module.exports = team;
