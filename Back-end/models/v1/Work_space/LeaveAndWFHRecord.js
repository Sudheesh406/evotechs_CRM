const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require('../Authentication/authModel');

const LeaveAndWFH = sequelize.define(
  "LeaveAndWFH",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    totalLeaves: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    totalWFH: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    createdAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: signup,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "LeaveAndWFH",
    timestamps: true,
  }
);

module.exports = LeaveAndWFH;
