"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Task.belongsTo(models.House, {
        foreignKey: "house_id",
        targetKey: "id",
      });

      Task.hasOne(models.TaskRepeatDay, {
        foreignKey: "task_id",
        targetKey: "id",
      });

      Task.belongsTo(models.HouseRoom, {
        foreignKey: "house_room_id",
        targetKey: "id",
      });
      //user_id
      Task.belongsTo(models.User, {
        foreignKey: "user_id",
        targetKey: "id",
      });
      // 담당자
      Task.belongsToMany(models.User, {
        through: "TaskAssignees",
        as: "assignees",
        foreignKey: "task_id",
        otherKey: "user_id",
      });
    }
  }
  Task.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      house_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      house_room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      //user_id추가
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      memo: {
        type: DataTypes.TEXT,
      },
      alarm: {
        type: DataTypes.TIME,
      },
      assignee_id: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
      },
      due_date: {
        type: DataTypes.DATE,
      },
      complete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Task",
      tableName: "tasks",
      timestamps: true,
    }
  );
  return Task;
};
