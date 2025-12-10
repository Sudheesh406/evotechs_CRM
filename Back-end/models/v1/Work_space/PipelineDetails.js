const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel"); // Staff table

const pipelineDetails = sequelize.define(
  "pipelineDetails",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    teamIds: {
      type: DataTypes.JSON, 
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayOfNumbers(value) {
          if (!Array.isArray(value)) {
            throw new Error("teamIds must be an array");
          }
          value.forEach((id) => {
            if (typeof id !== "number") {
              throw new Error("teamIds array must contain only numbers");
            }
          });
        },
      },
    },
    leadId: {
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
    tableName: "pipelineDetails",
    timestamps: true,
  }
);

module.exports = pipelineDetails;
