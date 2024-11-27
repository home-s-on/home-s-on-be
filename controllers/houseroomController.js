const { HouseRoom, House, Task, UserHouse } = require("../models");

// 구역 목록 조회
exports.getHouseRooms = async (req, res) => {
  try {
    const userId = req.userId;

    console.log("userId:", userId);

    const userHouse = await UserHouse.findOne({
      where: { user_id: userId },
      attributes: ["house_id"],
    });
    console.log("userHouse:", userHouse);

    let houseRooms = await HouseRoom.findAll({
      where: { house_id: userHouse.house_id },
      attributes: ["id", "house_id", "room_name"],
      order: [["createdAt", "ASC"]],
    });
    console.log("houseRooms:", houseRooms);

    // 구역이 없으면 기본 구역 자동 생성
    if (houseRooms.length === 0) {
      const defaultHouseRooms = [
        { house_id: userHouse.house_id, room_name: "거실" },
        { house_id: userHouse.house_id, room_name: "안방" },
        { house_id: userHouse.house_id, room_name: "화장실" },
        { house_id: userHouse.house_id, room_name: "주방" },
      ];
      console.log("defaultHouseRooms:", defaultHouseRooms);

      await HouseRoom.bulkCreate(defaultHouseRooms);

      // 생성된 구역들을 다시 조회
      houseRooms = await HouseRoom.findAll({
        where: { house_id: userHouse.house_id },
        attributes: ["id", "house_id", "room_name"],
        order: [["createdAt", "ASC"]],
      });
      console.log("created houseRooms:", houseRooms);
    }

    res.json({ success: true, data: houseRooms });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({
      success: false,
      error: "구역 목록을 가져올 수 없습니다.",
    });
  }
};

// 새 구역 추가
exports.addHouseRoom = async (req, res) => {
  try {
    const userId = req.userId;
    const { room_name } = req.body;

    if (!room_name) {
      return res
        .status(400)
        .json({ success: false, error: "구역 이름이 필요합니다." });
    }

    const userHouse = await UserHouse.findOne({
      where: { user_id: userId },
      attributes: ["house_id"],
    });

    const newHouseRoom = await HouseRoom.create({
      house_id: userHouse.house_id,
      room_name,
    });

    res.status(201).json({ success: true, data: newHouseRoom });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "구역을 추가할 수 없습니다." });
  }
};

// 구역 삭제
exports.deleteHouseRoom = async (req, res) => {
  try {
    const userId = req.userId;
    const houseRoomId = parseInt(req.params.houseRoomId);

    const userHouse = await UserHouse.findOne({
      where: { user_id: userId },
      attributes: ["house_id"],
    });

    // 해당 구역에 연결된 Task 확인
    const tasksCount = await Task.count({
      where: { house_room_id: houseRoomId },
    });

    if (tasksCount > 0) {
      return res.status(400).json({
        success: false,
        error: "이 구역에 연결된 할일이 있어 삭제할 수 없습니다.",
      });
    }

    const houseRoom = await HouseRoom.findOne({
      where: {
        id: houseRoomId,
        house_id: userHouse.house_id,
      },
    });

    if (!houseRoom) {
      return res
        .status(404)
        .json({ success: false, error: "구역을 찾을 수 없습니다." });
    }

    await houseRoom.destroy();
    res.json({ success: true, message: "구역이 삭제되었습니다." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "구역을 삭제할 수 없습니다." });
  }
};
