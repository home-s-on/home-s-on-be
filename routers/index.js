const express = require("express");
const router = express.Router();
const userApi = require("./user.api");
const authApi = require("./auth.api");
const houseApi = require("./house.api");
// const userhouseApi = require("./userhouse.api");

router.use("/user", userApi);
router.use("/auth", authApi);
router.use("/house", houseApi);
// router.use("/userhouse", userhouseApi);

module.exports = router;
