const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require('../Authentication/authModel')

const teamManagementHistory = sequelize.define(
  "teamManagementHistory",
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
      onDelete: 'CASCADE', 
    },
     teamId: {
      type: DataTypes.INTEGER
    },
    teamName: {
      type: DataTypes.STRING(100), 
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "team_management_history",
    timestamps: true, 
  }
);

module.exports = teamManagementHistory;
