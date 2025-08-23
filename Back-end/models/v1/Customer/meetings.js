const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel");
const contacts = require("../Customer/contacts");

const meetings = sequelize.define(
  "meetings",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
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
   contactId: {                
    type: DataTypes.INTEGER,
    allowNull: true,        
    references: {
      model: contacts,   
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    },
    meetingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9]+$/, // only numbers
        len: [7, 15], // min 7 digits, max 15
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
      status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "meetings",
    timestamps: true,
  }
);

module.exports = meetings;
