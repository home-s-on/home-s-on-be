const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authController = require("../controllers/auth.controller");

//사용자 집의 모든 할 일
router.get(
  "/house",
  authController.authenticate,
  taskController.getAllTasksByHouseId
);
//나의 할 일
router.get("/mytasks", authController.authenticate, taskController.getMyTasks);
//지난 할 일
router.get(
  "/pasttasks",
  authController.authenticate,
  taskController.getPastTasks
);
//할 일 추가
router.post("/add", authController.authenticate, taskController.addTask);
//할 일 편집
router.patch("/:taskId", authController.authenticate, taskController.editTask);
// router.put(
//   "/edit/:taskId",
//   authController.authenticate,
//   taskController.editTask
// );

//할 일 삭제
router.delete(
  "/delete/:taskId",
  authController.authenticate,
  taskController.deleteTask
);

module.exports = router;
