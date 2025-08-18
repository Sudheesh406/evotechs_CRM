// models/SecretCode.js
const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../database/dbConfigue");

const SecretCode = sequelize.define("secret_code", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "secret_codes",
  updatedAt: false, 
});

module.exports = SecretCode;
