const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller");
const authController = require("../controllers/auth.controller");

router.use(authController.authenticate);

router.post("/join/:houseId", memberController.joinToMember);
router.get("/members/:houseId", memberController.getMembersInHouse);

module.exports = router;
