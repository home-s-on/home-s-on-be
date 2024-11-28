const express = require("express");
const router = express.Router();
const userApi = require("./user.api");
const authApi = require("./auth.api");
const houseApi = require("./house.api");
const memberApi = require("./member.api");

router.use("/user", userApi);
router.use("/auth", authApi);
router.use("/house", houseApi);
router.use("/member", memberApi);

module.exports = router;
