const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../../../models/v1/Authentication/authModel");

const leaves = sequelize.define(
  "leaves",
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
    leaveType: {
      type: DataTypes.ENUM("morning", "afternoon", "fullday"),
      allowNull: false,
    },
    leaveDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approve", "Reject"),
      allowNull: false,
      defaultValue: "Pending",
    },
    category: {
      type: DataTypes.ENUM("Casual", "Medical", "unpaid"),
      allowNull: false,
      defaultValue: "Casual",
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
    tableName: "leaves",
    timestamps: true,
  }
);

module.exports = leaves;
