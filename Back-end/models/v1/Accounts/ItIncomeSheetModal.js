const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../../../models/v1/Authentication/authModel");

const ItincomeSheet = sequelize.define(
  "ItincomeSheet",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    month: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    entries: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    userId: {
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
    tableName: "ItincomeSheet",
    timestamps: true,
  }
);

module.exports = ItincomeSheet;
