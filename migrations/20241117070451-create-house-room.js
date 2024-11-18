"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("houserooms", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      house_room_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      house_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      Droom_type_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      is_delete: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("HouseRooms");
  },
};
