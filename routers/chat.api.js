const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const authController = require("../controllers/auth.controller");

router.use(authController.authenticate);

router.post("/", chatController.sendChat);
router.get("/", chatController.getChat);
router.post("/motivation", chatController.motivationChat);

module.exports = router;
