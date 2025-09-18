const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require('../../../models/v1/Authentication/authModel')


const holiday = sequelize.define(
  "holiday",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    holidayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    holidayDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "holiday",
    timestamps: true,
  }
);

module.exports = holiday;
