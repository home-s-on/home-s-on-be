"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class HouseRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // House 관계
      this.belongsTo(models.House, { foreignKey: "house_id" });
    }
  }
  HouseRoom.init(
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
      room_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "HouseRoom",
      tableName: "houserooms",
      timestamps: true,
    }
  );

  return HouseRoom;
};
