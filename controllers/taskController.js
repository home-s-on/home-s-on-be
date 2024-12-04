const { Task, HouseRoom, UserHouse, User } = require("../models");

//<<모든 할일보기>>
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const houseId = req.query.house_id;

    if (!houseId) {
      return res.status(400).json({
        success: false,
        error: "house_id가 필요합니다.",
      });
    }

    // UserHouse를 통한 권한 검증
    const userHouse = await UserHouse.findOne({
      where: {
        user_id: userId,
        house_id: houseId,
      },
    });

    if (!userHouse) {
      return res.status(403).json({
        success: false,
        error: "해당 집에 대한 접근 권한이 없습니다.",
      });
    }

    // 현재 선택된 house의 할일만 조회
    const tasks = await Task.findAll({
      where: {
        house_id: houseId,
      },
      include: [
        {
          model: HouseRoom,
          required: true, // INNER JOIN 사용
          where: {
            house_id: houseId,
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 담당자 정보 조회
    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        const taskJson = task.toJSON();
        const assignees = await UserHouse.findAll({
          where: {
            user_id: taskJson.assignee_id,
            house_id: houseId,
          },
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
          ],
        });

        taskJson.assignees = assignees
          .filter((assignee) => assignee.User)
          .map((assignee) => ({
            userId: assignee.User.id,
            nickname: assignee.User.nickname,
            isOwner: assignee.is_owner,
          }));

        return taskJson;
      })
    );

    res.json({
      success: true,
      data: tasksWithAssignees,
    });
  } catch (error) {
    console.error("할일 목록을 가져올 수 없습니다:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// <<나의 할일 보기>>
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.userId;

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
    const userId = req.userId;

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
    currentDate.setHours(0, 0, 0, 0); // 현재 날짜의 시간을 00:00:00으로 설정

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
    const pastTasks = allTasks.filter((task) => {
      const taskDueDate = new Date(task.due_date);
      taskDueDate.setHours(0, 0, 0, 0); // 작업 마감일 00:00:00으로 설정
      return (
        taskDueDate < currentDate && task.assignee_id.includes(parseInt(userId))
      );
    });

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

// 같은 집 구성원 조회
const getHouseMembers = async (houseId) => {
  const members = await UserHouse.findAll({
    where: { house_id: houseId },
    include: [
      {
        model: User,
        attributes: ["id", "nickname"],
      },
    ],
  });
  return members;
};

//<<할일 추가>>
exports.addTask = async (req, res) => {
  try {
    const userId = req.userId;
    const houseId = req.query.house_id; // URL 쿼리에서 house_id 가져오기
    const { house_room_id, title, memo, alarm, assignee_id, due_date } =
      req.body;

    // house_id 검증 추가
    if (!houseId) {
      return res.status(400).json({
        success: false,
        error: "house_id가 필요합니다.",
      });
    }

    // 필수 정보 검증
    if (!house_room_id || !title || !assignee_id) {
      return res.status(400).json({
        success: false,
        error: "필수 정보 누락!",
      });
    }

    // 현재 선택된 집에 대한 사용자 권한 확인
    const userHouse = await UserHouse.findOne({
      where: {
        user_id: userId,
        house_id: houseId,
      },
    });

    if (!userHouse) {
      return res.status(403).json({
        success: false,
        error: "해당 집에 대한 접근 권한이 없습니다.",
      });
    }

    // 담당자가 같은 집 구성원인지 확인
    const houseMembers = await getHouseMembers(houseId);
    const memberIds = houseMembers.map((member) => member.User.id);

    const validAssignees = assignee_id.every((id) => memberIds.includes(id));
    if (!validAssignees) {
      return res.status(400).json({
        success: false,
        error: "유효하지 않은 담당자가 포함되어 있습니다.",
      });
    }

    // 새 할일 생성 시 URL의 house_id 사용
    const newTask = await Task.create({
      house_id: houseId,
      house_room_id,
      title,
      memo,
      alarm,
      assignee_id,
      due_date,
      complete: false,
      user_id: userId,
    });

    // 생성된 할일 조회
    const createdTask = await Task.findOne({
      where: { id: newTask.id },
      include: [
        {
          model: HouseRoom,
          attributes: ["id", "room_name"],
          where: { house_id: houseId }, // house_id 조건 추가
        },
        {
          model: User,
          attributes: ["id", "nickname"],
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

//<할일 편집>
exports.editTask = async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = parseInt(req.params.taskId);
    // const houseId = req.query.house_id;
    const { house_room_id, title, memo, alarm, assignee_id, due_date } =
      req.body;

    // 할일 존재 여부 확인
    const task = await Task.findOne({
      where: {
        id: taskId,
        // house_id: houseId,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "할일을 찾을 수 없습니다.",
      });
    }

    // 작성자 본인인지 확인
    if (task.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "수정 권한이 없습니다.",
      });
    }

    // 할일 수정
    await task.update({
      house_room_id,
      title,
      memo,
      alarm,
      assignee_id,
      due_date,
    });

    // 수정된 할일 조회
    const updatedTask = await Task.findOne({
      where: { id: taskId },
      include: [
        {
          model: HouseRoom,
          attributes: ["id", "room_name"],
        },
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
    });

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error("할일 수정 중 오류:", error);
    res.status(500).json({
      success: false,
      error: "할일을 수정할 수 없습니다.",
    });
  }
};

//<<할일 삭제>>
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.userId;
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
