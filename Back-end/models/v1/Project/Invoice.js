const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/dbConfigue');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  staffId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },

  paid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

}, {
  tableName: 'Invoice',
  timestamps: true,
});

module.exports = Invoice;
