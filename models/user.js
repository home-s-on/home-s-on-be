"use strict";
const { Model } = require("sequelize");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    async generateToken() {
      const token = jwt.sign({ id: this.id }, JWT_SECRET_KEY, {
        expiresIn: "30d",
      });
      return token;
    }

    // 디바이스 토큰을 추가하는 메서드
    async addDeviceToken(newToken) {
      if (!this.deviceTokens) {
        this.deviceTokens = [];
      }

      // 중복 체크
      if (!this.deviceTokens.includes(newToken)) {
        this.deviceTokens = [...this.deviceTokens, newToken];
        await this.update({ deviceTokens: this.deviceTokens});
      }
      // 저장 후 데이터베이스에 다시 조회하여 확인
      await this.reload();
      //console.log(this.deviceTokens);
    }

    static associate(models) {
      User.hasOne(models.UserHouse, {
        foreignKey: "user_id",
        sourceKey: "id",
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING,
      },
      photo: {
        type: DataTypes.STRING,
      },
      deviceTokens: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      social_login_type: {
        type: DataTypes.ENUM("EMAIL", "KAKAO", "GOOGLE", "APPLE"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: false,
    }
  );

  return User;
};
