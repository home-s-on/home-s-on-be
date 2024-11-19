"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserHouse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserHouse.belongsTo(models.User, {
        foreignKey: "user_id",
        targetKey: "id",
      });

      UserHouse.belongsTo(models.House, {
        foreignKey: "house_id",
        targetKey: "id",
      });

      UserHouse.hasOne(models.Setting, {
        foreignKey: "user_id",
        sourceKey: "user_id",
      });
    }
  }
  UserHouse.init(
    {
      house_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      is_owner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "UserHouse",
      tableName: "userhouses",
    }
  );
  return UserHouse;
};
