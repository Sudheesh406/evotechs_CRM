// models/SecretCode.js
// models/v1/Authentication/secretCode.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require('../Authentication/authModel'); 

const SecretCode = sequelize.define(
  "secret_code",
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
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "secret_codes",
    updatedAt: false,
  }
);

module.exports = SecretCode;
