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
