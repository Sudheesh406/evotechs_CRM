"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("meetings", "TeamStaffId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "signup", // your table name
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("meetings", "TeamStaffId");
  },
};
