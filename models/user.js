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
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      deviceToken: {
        type: DataTypes.STRING,
      },
      kakao: {
        type: DataTypes.STRING,
      },
      apple: {
        type: DataTypes.STRING,
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
