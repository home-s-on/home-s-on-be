'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.House, {foreignKey:"id"})
      this.hasOne(models.TaskRepeatDay, {foreignKey:"task_id"})
    }
  }
  Task.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    memo: {
      type: DataTypes.STRING,
    },
    alarm: {
      type: DataTypes.TIME,
    },
    assignee_id: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATE,
    },
    complete: { 
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
    timestamps: true
  });
  return Task;
};