const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");

const Pipelines = sequelize.define("Pipelines", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  data: {
    type: DataTypes.JSON,   // stores nodes + edges
    allowNull: false,
  },
});

module.exports = Pipelines;
