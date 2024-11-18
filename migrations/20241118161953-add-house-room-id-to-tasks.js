"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tasks", "house_room_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "houserooms",
        key: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tasks", "house_room_id");
  },
};
