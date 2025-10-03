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
      
    });

    // Add time column
    await queryInterface.addColumn("secret_codes", "time", {
      type: Sequelize.TIME,
      allowNull: true, // change to false if you want it required
      
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns in reverse order
    await queryInterface.removeColumn("secret_codes", "time");
    await queryInterface.removeColumn("secret_codes", "date");
    await queryInterface.removeColumn("secret_codes", "staffId");
  },
};
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("secret_codes");

    if (!table.staffId) {
      await queryInterface.addColumn("secret_codes", "staffId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "signup",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }

    if (!table.date) {
      await queryInterface.addColumn("secret_codes", "date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }

    if (!table.time) {
      await queryInterface.addColumn("secret_codes", "time", {
        type: Sequelize.TIME,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("secret_codes");

    if (table.time) {
      await queryInterface.removeColumn("secret_codes", "time");
    }
    if (table.date) {
      await queryInterface.removeColumn("secret_codes", "date");
    }
    if (table.staffId) {
      await queryInterface.removeColumn("secret_codes", "staffId");
    }
  },
};
