"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("customrooms", {
      Croom_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      house_room_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "HouseRoom",
          key: "house_room_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      Croom_name: {
        allowNull: false,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("CustomRooms");
  },
};
