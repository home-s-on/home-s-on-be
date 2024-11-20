const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

//사용자 집의 모든 할 일
router.get("/house/:houseId", taskController.getAllTasksByHouseId);

module.exports = router;
