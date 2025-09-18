'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('holiday', 'createdAdminId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'signup', // name of the target table (not the model)
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // will set to null if signup row deleted
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('holiday', 'createdAdminId');
  },
};
