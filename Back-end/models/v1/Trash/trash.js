// models/SecretCode.js
// models/v1/Authentication/secretCode.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require('../Authentication/authModel'); 

const trash = sequelize.define(
  "trash",
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
    data: {
      type: DataTypes.STRING,
      allowNull: false,
    },
     dataId: {
    type: DataTypes.INTEGER, 
    allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "trash",
    updatedAt: false,
  }
);

module.exports = trash;
