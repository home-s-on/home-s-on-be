const express = require("express");
const router = express.Router();
const userApi = require("./user.api");
const authApi = require("./auth.api");
const houseApi = require("./house.api");
const memberApi = require("./member.api");
const taskApi = require("./taskRouter");
const roomApi = require("./houseroomRouter");
const apns = require("./apns.api");
const chatApi = require("./chat.api");

router.use("/user", userApi);
router.use("/auth", authApi);
router.use("/house", houseApi);
router.use("/member", memberApi);
router.use("/tasks", taskApi);
router.use("/rooms", roomApi);
router.use("/noti", apns);
router.use("/chat", chatApi);

module.exports = router;
