const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel");

const attendance = sequelize.define(
  "attendance",
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
    attendanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("entry", "exit"),
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "attendance",
    timestamps: true, // adds createdAt, updatedAt
  }
);

module.exports = attendance;
