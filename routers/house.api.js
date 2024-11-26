const express = require("express");
const router = express.Router();
const houseController = require("../controllers/house.controller");
const authController = require("../controllers/auth.controller");

router.post(
  "/create",
  authController.authenticate,
  houseController.createHouse
);
router.get(
  "/getInviteCode",
  authController.authenticate,
  houseController.getInviteCode
);

module.exports = router;
