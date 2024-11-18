"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Setting.belongsTo(models.User, {
        foreignKey: "user_id",
      });

      Setting.belongsTo(models.Member, {
        foreignKey: "member_id",
      });
    }
  }
  Setting.init(
    {
      // invite_code: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      // },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "Setting",
      tableName: "settings",
      timestamps: true,
    }
  );
  return Setting;
};
