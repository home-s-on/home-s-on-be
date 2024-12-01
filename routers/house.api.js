const express = require("express");
const router = express.Router();
const houseController = require("../controllers/house.controller");
const authController = require("../controllers/auth.controller");

router.use(authController.authenticate);

router.post("/create", houseController.createHouse);
router.get("/getInviteCode", houseController.getInviteCode);
router.post("/join", houseController.joinToHouse);
router.post("/gethouseId", houseController.getHouseId);

module.exports = router;
