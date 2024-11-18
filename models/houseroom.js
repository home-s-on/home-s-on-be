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
      //DefaultRoom 관계
      this.belongsTo(models.DefaultRoom, { foreignKey: "Droom_type_id" });
      // CustomRoom 관계
      this.hasMany(models.CustomRoom, { foreignKey: "house_room_id" });
      // House 관계
      this.belongsTo(models.House, { foreignKey: "house_id" });
    }
  }
  HouseRoom.init(
    {
      house_room_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      house_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Droom_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
