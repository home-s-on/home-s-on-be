const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

//사용자 집의 모든 할 일
router.get("/house/:houseId", taskController.getAllTasksByHouseId);
// 나의 할 일
router.get("/mytasks/:userId", taskController.getMyTasks);
//지난 할 일
router.get("/pasttasks/:userId", taskController.getPastTasks);

module.exports = router;
