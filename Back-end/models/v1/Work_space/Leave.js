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
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    description: {
      type: DataTypes.ENUM(
        "Personal",
        "Family",
        "Medical",
        "Emergency",
      ),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approve", "Reject"),
      allowNull: false,
      defaultValue: "Pending",
    },
    category: {
      type: DataTypes.ENUM("Leave", "WFH"),
      allowNull: false,
      defaultValue: "Leave",
    },
    HalfTime: {
      type: DataTypes.ENUM("Offline", "Leave"),
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
    tableName: "leaves",
    timestamps: true,
  }
);

module.exports = leaves;
