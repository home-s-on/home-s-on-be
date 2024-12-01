const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller");
const authController = require("../controllers/auth.controller");

router.post(
  "/join/:houseId",
  authController.authenticate,
  memberController.joinToMember
);

module.exports = router;
