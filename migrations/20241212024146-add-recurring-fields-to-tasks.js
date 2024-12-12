"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tasks", "parent_task_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "tasks",
        key: "id",
      },
    });

    await queryInterface.addColumn("tasks", "is_recurring", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tasks", "parent_task_id");
    await queryInterface.removeColumn("tasks", "is_recurring");
  },
};
