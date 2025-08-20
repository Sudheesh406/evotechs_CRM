const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/dbConfigue');
const signup = require('../Authentication/authModel'); 

const contacts = sequelize.define('contacts', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('high', 'normal', 'low'),
    allowNull: false,
    defaultValue: 'normal',
  },
   amount: {
    type: DataTypes.DECIMAL(10, 2),  
    allowNull: true,
    defaultValue: 0.00,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  softDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  staffId: {                
    type: DataTypes.INTEGER,
    allowNull: true,        
    references: {
      model: signup,   
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'contacts',
  timestamps: true,
});



module.exports = contacts;
