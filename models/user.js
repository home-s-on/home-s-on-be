"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profileImgUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      socialLoginType: {
        type: DataTypes.ENUM("NAVER", "KAKAO", "GOOGLE", "APPLE"),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: true,
    }
  );
  return User;
};
