"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      {
        nickname: "john",
        email: "john@gmail.com",
        profile_img_url: "photo.jpg",
        social_login_type: "GOOGLE",
        password: "john1234",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nickname: "james",
        email: "james@naver.com",
        profile_img_url: "photo.jpg",
        social_login_type: "NAVER",
        password: "jm1212",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
