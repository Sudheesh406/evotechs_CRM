const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/dbConfigue');
const signup = require('../Authentication/authModel'); 

const Trash = sequelize.define('trash', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dateTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dataName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dataId: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  tableName: 'trash',
  timestamps: false, // since we have our own dateTime field
});

module.exports = Trash;
