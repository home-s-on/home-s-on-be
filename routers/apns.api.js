const express = require("express");
const router = express.Router();

const apnsController = require("../controllers/apns.controller");

router.post("/", apnsController.sendPushNotification);
module.exports = router;
