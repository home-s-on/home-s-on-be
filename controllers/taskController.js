const { Task, HouseRoom, UserHouse, User } = require("../models");

//<<모든 할일보기>>
exports.getAllTasksByHouseId = async (req, res) => {
  try {
    const houseId = req.params.houseId;

    //인증 미들웨어 houseId

    if (!houseId) {
      return res
        .status(400)
        .json({ success: false, error: "House ID가 필요합니다" });
    }

    const tasks = await Task.findAll({
      where: {
        house_id: houseId,
      },
      include: [
        {
          model: HouseRoom,
          attributes: ["id", "room_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        error: "등록된 할일이 없습니다. 새로운 할 일을 추가해보세요",
      });
    }

    // 각 task의 assignee 정보
    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        const taskJson = task.toJSON();
        const assignees = await UserHouse.findAll({
          where: {
            house_id: houseId,
            user_id: taskJson.assignee_id, // assignee_id 배열
          },
          include: [
            {
              model: User,
              attributes: ["id", "nickname", "profile_img_url"],
            },
          ],
        });

        taskJson.assignees = assignees.map((assignee) => assignee.User);
        return taskJson;
      })
    );

    res.json({ success: true, data: tasksWithAssignees });
  } catch (error) {
    console.error("할일 목록을 가져올 수 없습니다:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// <<나의 할일 보기>>
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "사용자 ID가 필요합니다." });
    }

    // 사용자의 house_id찾기
    const userHouse = await UserHouse.findOne({
      where: { user_id: userId },
      attributes: ["house_id"],
    });

    if (!userHouse) {
      return res.status(404).json({
        success: false,
        error:
          "사용자의 집을 찾을 수 없습니다. 사용자가 집에 등록되어있는지 확인해주세요.",
      });
    }

    // 해당 house_id의 모든 할일 가져오기
    const allTasks = await Task.findAll({
      where: {
        house_id: userHouse.house_id,
      },
      include: [
        {
          model: HouseRoom,
          attributes: ["id", "room_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // JavaScript 사용 -> 사용자의 할일 만 필터링..
    const tasks = allTasks.filter(
      (task) => task.assignee_id.includes(parseInt(userId)) //문자열 -> 정수반환
    );

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "사용자의 할일 목록이 비어있습니다." });
    }

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error("할일 목록을 가져올 수 없습니다:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
