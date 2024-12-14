const { Task, HouseRoom, UserHouse, User } = require("../models");
const { Op } = require("sequelize");

//<<모든 할일보기>>
exports.getAllTasksByHouseId = async (req, res) => {
  try {
    const userId = req.userId; // token userId

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

    const tasks = await Task.findAll({
      where: {
        house_id: userHouse.house_id,
      },
      include: [
        {
          model: HouseRoom,
          attributes: ["id", "room_name"],
        },
      ],
      //order: [["createdAt", "DESC"]],
      order: [
        ["complete", "ASC"], // 완료되지 않은 항목이 먼저 오도록
        ["createdAt", "DESC"], // 같은 완료 상태 내에서는 최신순
      ],
    });

    if (tasks.length === 0) {
      return res.status(200).json({ success: true, data: [] }); // 빈 배열 반환
    }

    // 각 task의 assignee 정보
    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        const taskJson = task.toJSON();
        const assignees = await UserHouse.findAll({
          where: {
            house_id: userHouse.house_id, // houseId를 userHouse.house_id로 수정
            user_id: taskJson.assignee_id,
          },
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
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
        assignee_id: {
          [Op.contains]: [userId], // userId가 assignee_id 배열에 포함되어 있는지 확인
        },
      },
      include: [
        {
          model: HouseRoom,
          attributes: ["id", "room_name"],
        },
        {
          model: User,
          as: "assignees", // Assignees를 가져오기 위한 설정
          attributes: ["id", "nickname"],
          through: { attributes: [] }, // 중간 테이블 속성 제외
        },
      ],
      //order: [["createdAt", "DESC"]],
      order: [
        ["complete", "ASC"], // 완료되지 않은 항목
        ["createdAt", "DESC"], // 같은 완료 상태 최신순
      ],
    });

    if (tasks.length === 0) {
      return res.status(200).json({ success: true, data: [] }); // 빈 배열 반환
    }

    // 각 task의 assignee 정보 추가
    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        const taskJson = task.toJSON();
        const assignees = await UserHouse.findAll({
          where: {
            house_id: userHouse.house_id, // houseId를 userHouse.house_id로 수정
            user_id: taskJson.assignee_id,
          },
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
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

//할일 추가
exports.addTask = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      house_room_id,
      title,
      memo,
      alarm,
      assignee_id,
      due_date,
      repeat_day,
      end_date,
    } = req.body;

    // 필수 정보 확인
    if (!house_room_id || !title || !assignee_id) {
      return res.status(400).json({
        success: false,
        error: "필수 정보가 누락되었습니다.",
      });
    }

    const userHouse = await UserHouse.findOne({
      where: { user_id: userId },
      attributes: ["house_id"],
    });

    if (!userHouse) {
      return res.status(404).json({
        success: false,
        error: "사용자의 집을 찾을 수 없습니다.",
      });
    }

    const isRecurring = repeat_day && repeat_day.length > 0;

    if (isRecurring && end_date && new Date(end_date) < new Date(due_date)) {
      return res.status(400).json({
        success: false,
        error: "종료일은 마감일 이후여야 합니다.",
      });
    }

    const newTask = await Task.create({
      house_id: userHouse.house_id,
      house_room_id,
      title,
      memo,
      alarm,
      assignee_id,
      due_date: isRecurring
        ? getNextOccurrence(
            new Date(),
            repeat_day,
            new Date(due_date),
            end_date ? new Date(end_date) : null
          )
        : due_date,
      complete: false,
      end_date: isRecurring ? end_date : null,
      user_id: userId,
      repeat_day: isRecurring ? repeat_day : null,
      is_recurring: isRecurring,
    });

    const createdTask = await Task.findOne({
      where: { id: newTask.id },
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

    res.status(201).json({ success: true, data: createdTask });
  } catch (error) {
    console.error("할일을 추가할 수 없습니다:", error);
    res.status(500).json({
      success: false,
      error: "서버 내부 오류로 인해 할일을 추가할 수 없습니다.",
    });
  }
};

function getNextOccurrence(startDate, repeatDays, dueDate, endDate) {
  let nextDate = new Date(startDate);
  nextDate.setHours(0, 0, 0, 0);

  const finalEndDate = endDate ? new Date(Math.min(dueDate, endDate)) : dueDate;

  while (nextDate <= finalEndDate) {
    if (repeatDays.includes(nextDate.getDay())) {
      return nextDate;
    }
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return null;
}
//<할일 편집>
exports.editTask = async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = parseInt(req.params.taskId);
    const {
      house_room_id,
      title,
      memo,
      alarm,
      assignee_id,
      due_date,
      repeat_day,
    } = req.body;

    // 할일 존재 여부 확인
    const task = await Task.findOne({
      where: { id: taskId },
      include: [
        { model: HouseRoom, attributes: ["id", "room_name"] },
        { model: User, attributes: ["id", "nickname"] },
      ],
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, error: "할일을 찾을 수 없습니다." });
    }

    // 작성자 본인인지 확인
    if (task.user_id !== userId) {
      return res
        .status(403)
        .json({ success: false, error: "수정 권한이 없습니다." });
    }

    const isRecurring = repeat_day && repeat_day.length > 0;

    // 할일 수정
    const updatedTask = await task.update({
      house_room_id,
      title,
      memo,
      alarm,
      assignee_id,
      due_date: isRecurring
        ? getNextOccurrence(new Date(), repeat_day, new Date(due_date))
        : due_date,
      repeat_day: isRecurring ? repeat_day : null,
      is_recurring: isRecurring,
    });

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("할일 수정 중 오류:", error);
    res
      .status(500)
      .json({ success: false, error: "할일을 수정할 수 없습니다." });
  }
};

function getNextOccurrence(startDate, repeatDays, endDate) {
  let nextDate = new Date(startDate);
  nextDate.setHours(0, 0, 0, 0);

  while (nextDate <= endDate) {
    if (repeatDays.includes(nextDate.getDay())) {
      return nextDate;
    }
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return null;
}

//할일완료
exports.completeTask = async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = parseInt(req.params.taskId);

    const task = await Task.findOne({
      where: { id: taskId },
      include: [
        {
          model: HouseRoom,
          attributes: ["id", "room_name"],
        },
      ],
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, error: "할일을 찾을 수 없습니다." });
    }

    //담당자
    const assigneeIds = Array.isArray(task.assignee_id)
      ? task.assignee_id
      : JSON.parse(task.assignee_id);
    if (!assigneeIds.includes(userId)) {
      return res
        .status(403)
        .json({ success: false, error: "할일 담당자만 완료할 수 있습니다." });
    }

    //할일 -> 완료 상태 업데이트
    const updatedTask = await task.update({ complete: true });

    let nextTask = null;
    //반복할일 -> 다음주 요일 할일 생성
    if (task.is_recurring && task.repeat_day && task.repeat_day.length > 0) {
      //다음 날짜 계산
      const nextDate = getNextOccurrence(
        new Date(task.due_date),
        task.repeat_day
      );

      //다음 날짜가 존재한다면...-> 새로운 할일 생성!
      if (nextDate) {
        nextTask = await Task.create({
          house_id: task.house_id,
          house_room_id: task.house_room_id,
          title: task.title,
          memo: task.memo,
          alarm: task.alarm,
          assignee_id: task.assignee_id,
          due_date: nextDate,
          complete: false,
          user_id: task.user_id,
          repeat_day: task.repeat_day,
          is_recurring: true,
        });
        console.log("New recurring task created:", nextTask.id);
      }
    }

    res.json({
      success: true,
      data: { completedTask: updatedTask, nextTask },
      message: "할일이 완료되었습니다.",
    });
  } catch (error) {
    console.error("할일 완료 상태 변경 중 오류:", error);
    res
      .status(500)
      .json({ success: false, error: "할일 완료 상태를 변경할 수 없습니다." });
  }
};

//다음 반복 날짜 계산 함수
function getNextOccurrence(startDate, repeatDays) {
  let nextDate = new Date(startDate);
  nextDate.setDate(nextDate.getDate() + 1);
  nextDate.setHours(0, 0, 0, 0);

  // 다음 7일 동안 검색
  for (let i = 0; i < 7; i++) {
    // 반복 요일 해당 -> 해당 날짜 반환
    if (repeatDays.includes(nextDate.getDay())) {
      return nextDate;
    }
    //하루씩 증가
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return null;
}

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
