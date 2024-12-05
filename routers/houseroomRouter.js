const express = require("express");
const router = express.Router();
const houseRoomController = require("../controllers/houseroomController");
const authController = require("../controllers/auth.controller");

// 구역 목록 조회
router.get("/", authController.authenticate, houseRoomController.getHouseRooms);

// 새 구역 추가
router.post("/", authController.authenticate, houseRoomController.addHouseRoom);

// 구역 삭제
router.delete(
  "/:houseRoomId",
  authController.authenticate,
  houseRoomController.deleteHouseRoom
);

module.exports = router;
