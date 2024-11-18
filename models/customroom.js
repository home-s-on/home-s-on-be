"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CustomRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // HouseRoom 관계
      this.belongsTo(models.HouseRoom, { foreignKey: "house_room_id" });
    }
  }
  CustomRoom.init(
    {
      Croom_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      house_room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Croom_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CustomRoom",
      tableName: "customrooms",
      timestamps: true,
    }
  );

  return CustomRoom;
};
