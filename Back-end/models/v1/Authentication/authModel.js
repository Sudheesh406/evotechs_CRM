const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/dbConfigue');

const Signup = sequelize.define('signup', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  role: {
    type: DataTypes.ENUM('staff','admin'),
    allowNull: false,
    defaultValue: 'staff',
  },
}, {
  tableName: 'signup',
  timestamps: true,
});


module.exports = Signup;
