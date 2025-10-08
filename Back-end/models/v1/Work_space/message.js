const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/dbConfigue');
const signup = require('../Authentication/authModel'); 
const team = require("../../../models/v1/Team_work/team");

const messages = sequelize.define('messages', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  receiverId: {                
    type: DataTypes.INTEGER,
    allowNull: true,        
    references: {
      model: signup,   
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: "SET NULL",
  },
  senderId: {                
    type: DataTypes.INTEGER,
    allowNull: false,        
    references: {
      model: signup,   
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: "CASCADE",
  },
  sendingTime: {
    type: DataTypes.TEXT,
    allowNull: false,
    
  },
  sendingDate: {
    type: DataTypes.TEXT,
    allowNull: false,
    
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,        
    references: {
      model: team,   
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  softDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'messages',
  timestamps: true, // adds createdAt and updatedAt
});

module.exports = messages;
