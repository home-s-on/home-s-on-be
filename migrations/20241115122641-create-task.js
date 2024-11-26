"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tasks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      house_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "houses",
          key: "id",
        },
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      memo: {
        type: Sequelize.TEXT,
      },
      alarm: {
        type: Sequelize.TIME,
      },
      assignee_id: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATE,
      },
      complete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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
    await queryInterface.dropTable("tasks");
  },
};
