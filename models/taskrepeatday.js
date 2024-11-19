"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TaskRepeatDay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TaskRepeatDay.belongsTo(models.Task, {
        foreignKey: "task_id",
        targetKey: "id",
      });
    }
  }
  TaskRepeatDay.init(
    {
      day_of_week: {
        type: DataTypes.INTEGER,
        // primaryKey: true,
        allowNull: false,
        validate: {
          min: 0,
          max: 6,
        },
      },
    },
    {
      sequelize,
      modelName: "TaskRepeatDay",
      tableName: "taskrepeatdays",
      timestamps: true,
    }
  );
  return TaskRepeatDay;
};
