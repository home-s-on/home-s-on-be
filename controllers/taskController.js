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

    // 사용자의 house_id 찾기
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

    // 해당 사용자의 할일만 직접 조회
    const tasks = await Task.findAll({
      where: {
        house_id: userHouse.house_id,
        user_id: userId,
      },
      include: [
        {
          model: HouseRoom,
          attributes: ["id", "room_name"],
        },
        {
          model: User,
          as: "assignees",
          attributes: ["id", "nickname"],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

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

// <<지난 할일 보기>>
exports.getPastTasks = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "사용자 ID가 필요합니다." });
    }
    // 사용자의 house_id 찾기
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

    const currentDate = new Date();

    // 해당 house_id의 모든 할일
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
      order: [["due_date", "DESC"]],
    });

    // 지난 할일 필터링
    const pastTasks = allTasks.filter(
      (task) =>
        new Date(task.due_date) < currentDate &&
        task.assignee_id.includes(parseInt(userId))
    );

    if (pastTasks.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "지난 할일이 없습니다." });
    }

    res.json({ success: true, data: pastTasks });
  } catch (error) {
    console.error("지난 할일 목록을 가져올 수 없습니다:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

//<<할일 추가>>
exports.addTask = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 인증 미들웨어 사용자 ID
    //const userId = req.user.id;

    const { house_room_id, title, memo, alarm, assignee_id, due_date } =
      req.body;

    // 필수 정보
    if (!house_room_id || !title || !assignee_id) {
      return res.status(400).json({
        success: false,
        error: "필수 정보 누락 !",
      });
    }

    // 사용자의 house_id 찾기
    const userHouse = await UserHouse.findOne({
      where: { user_id: userId },
      attributes: ["house_id"],
    });

    if (!userHouse) {
      return res.status(404).json({
        success: false,
        error:
          "사용자의 집을 찾을 수 없습니다. 사용자가 집에 등록되어 있는지 확인해주세요.",
      });
    }

    //새 할일 생성
    const newTask = await Task.create({
      house_id: userHouse.house_id,
      house_room_id,
      title,
      memo,
      alarm,
      assignee_id,
      due_date,
      complete: false, // 기본 false , 완료 true
      user_id: userId,
    });

    //생성한 새 할 일 정보 조회
    const createdTask = await Task.findOne({
      where: { id: newTask.id },
      include: [
        {
          model: HouseRoom,
          attributes: ["id", "room_name"],
        },
        {
          model: User,
          attributes: ["id", "nickname", "profile_img_url"],
        },
      ],
    });

    res.status(201).json({ success: true, data: createdTask });
  } catch (error) {
    console.error("할일을 추가할 수 없습니다:", error);
    res.status(500).json({
      success: false,
      error: "서버 내부 오류로 인해 할일을 추가할 수 없습니다.",
    });
  }
};

//<<할일 삭제>>
exports.deleteTask = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const taskId = parseInt(req.params.taskId);

    const task = await Task.findOne({
      where: { id: taskId },
      include: [{ model: User, attributes: ["id"] }],
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, error: "할일을 찾을 수 없습니다." });
    }

    // 할일 등록자 확인
    if (task.User.id !== userId) {
      return res.status(403).json({
        success: false,
        error: "삭제 권한이 없습니다.",
      });
    }

    await task.destroy();
    res.json({ success: true, message: "할일이 삭제되었습니다" });
  } catch (error) {
    console.error("할일을 삭제할 수 없습니다:", error);
    res.status(500).json({
      success: false,
      error: "서버 내부 오류로 인해 할일을 삭제할 수 없습니다.",
    });
  }
};
