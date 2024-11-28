const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller");
const authController = require("../controllers/auth.controller");

router.post(
  "/create/:houseId",
  authController.authenticate,
  memberController.createMember
);

module.exports = router;
