"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("task", "teamWork", {
      type: Sequelize.JSON, // ✅ JSON column
      allowNull: true,
      defaultValue: []
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("task", "teamWork");
  },
};
