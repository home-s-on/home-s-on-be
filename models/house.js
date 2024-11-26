"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class House extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      House.hasMany(models.UserHouse, {
        foreignKey: "house_id",
        sourceKey: "id",
      });

      House.hasOne(models.HouseRoom, {
        foreignKey: "house_id",
        sourceKey: "id",
      });

      House.hasMany(models.UserHouse, {
        foreignKey: "house_id",
        sourceKey: "id",
      });

      House.hasMany(models.Task, {
        foreignKey: "house_id",
        sourceKey: "id",
      });

      House.hasMany(models.Member, {
        foreignKey: "house_id",
        sourceKey: "id",
      });
    }
  }
  House.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      invite_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "House",
      tableName: "houses",
      timestamps: true,
    }
  );
  return House;
};
