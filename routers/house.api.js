const express = require("express");
const router = express.Router();
const houseController = require("../controllers/house.controller");

router.post("/create", houseController.createHouse);
router.get("/getInviteCode/:user_id", houseController.getInviteCode);

module.exports = router;
