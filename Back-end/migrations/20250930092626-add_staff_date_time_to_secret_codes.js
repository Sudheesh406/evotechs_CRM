"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add staffId column with foreign key reference to signup.id
    await queryInterface.addColumn("secret_codes", "staffId", {
      type: Sequelize.INTEGER,
      allowNull: true, // change to false if required
      references: {
        model: "signup", // make sure table name is correct
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add date column
    await queryInterface.addColumn("secret_codes", "date", {
      type: Sequelize.DATEONLY,
      allowNull: true, // change to false if you want it required
      defaultValue: Sequelize.NOW, // optional default to current date
    });

    // Add time column
    await queryInterface.addColumn("secret_codes", "time", {
      type: Sequelize.TIME,
      allowNull: true, // change to false if you want it required
      defaultValue: Sequelize.literal("CURRENT_TIME"), // sets default to current time
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns in reverse order
    await queryInterface.removeColumn("secret_codes", "time");
    await queryInterface.removeColumn("secret_codes", "date");
    await queryInterface.removeColumn("secret_codes", "staffId");
  },
};
