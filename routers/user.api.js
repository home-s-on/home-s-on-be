const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

router.get("/", authController.authenticate, userController.getUser);

module.exports = router;
