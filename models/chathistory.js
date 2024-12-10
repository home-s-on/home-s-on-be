"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ChatHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ChatHistory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_message: {
        type: DataTypes.TEXT,
      },
      assistant_response: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "ChatHistory",
      tableName: "chathistories",
    }
  );
  return ChatHistory;
};
