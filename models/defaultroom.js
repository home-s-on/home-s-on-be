"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DefaultRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DefaultRoom.init(
    {
      Droom_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Droom_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DefaultRoom",
      tableName: "defaultrooms",
      timestamps: true,
    }
  );

  return DefaultRoom;
};
