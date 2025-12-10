const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");
const signup = require("../Authentication/authModel");

const staffPipeline = sequelize.define(
  "staffPipeline",
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
      onDelete: "CASCADE",
    },
     subStaffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: signup, 
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    softDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "staffPipeline",
    timestamps: true, // adds createdAt, updatedAt
  }
);

module.exports = staffPipeline;
