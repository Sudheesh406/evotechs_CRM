const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../database/dbConfigue");

const Pipeline = sequelize.define("Pipeline", {
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

module.exports = Pipeline;
