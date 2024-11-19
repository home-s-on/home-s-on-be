"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Member.hasOne(models.Setting, {
        foreignKey: "member_id",
        sourceKey: "id",
      });

      Member.belongsTo(models.House, {
        foreignKey: "house_id",
        targetKey: "id",
      });
    }
  }
  Member.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      members_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      house_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Member",
      tableName: "members",
    }
  );
  return Member;
};
