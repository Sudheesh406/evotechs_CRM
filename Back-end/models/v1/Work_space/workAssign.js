const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue"); // your DB config

const workAssign = sequelize.define(
  "workAssign",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT, // allows longer text
      allowNull: false,
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "signup", // reference the signup table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    createrId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "signup", // reference the signup table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    workUpdate: {
      type: DataTypes.ENUM("Pending", "Progress", "Completed"),
      allowNull: false,
      defaultValue: "Pending",
    },
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
  },
  {
    tableName: "workAssign",
    timestamps: true,
  }
);

module.exports = workAssign;
