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
      try {
        if (!this.deviceTokens) {
          this.deviceTokens = [];
        }

        // 중복 체크
        if (!this.deviceTokens.includes(newToken)) {
          //this.deviceTokens.push(newToken);
          const updatedTokens = [...this.deviceTokens, newToken];

          //명시적으로 변경 사항을 알림
          this.changed("deviceTokens", true);

          const result = await this.update(
            {
              deviceTokens: updatedTokens,
            },
            {
              //명시적으로 필드 지정
              fields: ["deviceTokens"],
            }
          );

          if (!result) {
            throw new Error("데이터베이스 업데이트 실패");
          }
          //reload 전에 현재 인스턴스의 deviceTokens 업데이트
          this.deviceTokens = updatedTokens;
        }
        // 저장 후 데이터베이스에 다시 조회하여 확인
        await this.reload();
      } catch (error) {
        console.error("디바이스 토큰 추가 실패: ", error);
        throw error;
      }
      //console.log("리로드 후 토큰: ", this.deviceTokens);
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
