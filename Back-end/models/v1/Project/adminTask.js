const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel");

const AdminActivity = sequelize.define(
  "AdminActivity",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // --- Core Fields ---
    taskName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
      allowNull: false,
      defaultValue: "Medium",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // --- Relations ---
      adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: signup,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    // --- Metadata ---
    status: {
      type: DataTypes.ENUM("Not Started", "In Progress", "Final Stage", "Completed"),
      allowNull: false,
      defaultValue: "Not Started",
    },

    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "AdminActivity",
    timestamps: true,
  }
);

module.exports = AdminActivity;
