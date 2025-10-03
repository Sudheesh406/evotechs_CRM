'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('secret_codes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
      // ✅ no updatedAt since you disabled it in the model
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('secret_codes');
  }
};
