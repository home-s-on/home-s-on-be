const { sequelize, House, UserHouse, User } = require("../models");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const houseController = {};

async function createHouseAndUserHouse(userId, inviteCode) {
  const t = await sequelize.transaction();

  try {
    // House 생성
    const house = await House.create(
      {
        invite_code: inviteCode,
      },
      { transaction: t }
    );

    // UserHouse 생성
    await UserHouse.create(
      {
        house_id: house.id,
        user_id: userId,
        is_owner: true, // 집을 생성하는 사용자를 소유자로 설정
      },
      { transaction: t }
    );

    // 트랜잭션 커밋
    await t.commit();

    return house;
  } catch (error) {
    // 에러 발생 시 롤백
    await t.rollback();
    throw error;
  }
}

houseController.createHouse = async (req, res) => {
  try {
    const { userId } = req;

    const existingHouse = await House.findOne({
      where: { id: userId },
    });

    if (existingHouse) {
      const user = await User.findOne({ where: { id: userId } });

      return res.status(201).json({
        status: "success",
        message: "기존에 생성되었던 house 데이터를 반환합니다.",
        data: {
          houseId: existingHouse.id,
          nickname: user.nickname,
          inviteCode: existingHouse.invite_code,
        },
      });
    }

    const inviteCode = await randomStringGenerator();
    const house = await createHouseAndUserHouse(userId, inviteCode);
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    const nickname = user.nickname;

    res.status(201).json({
      status: "success",
      message: "House created successfully",
      data: { houseId: house.id, nickname, inviteCode: house.invite_code },
    });
  } catch (error) {
    console.error("Error creating house:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

houseController.getInviteCode = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findOne({
      where: { id: userId },
    });
    if (user) {
      const userHouse = await UserHouse.findOne({
        where: { user_id: user.id },
      });
      if (!userHouse) {
        return res
          .status(404)
          .json({ status: "fail", message: "house not found" });
      }

      const house = await House.findOne({ where: { id: userHouse.house_id } });
      if (!house) {
        return res
          .status(404)
          .json({ status: "fail", message: "Invalid invite code" });
      }

      return res
        .status(201)
        .json({ status: "success", inviteCode: house.invite_code });
    }
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

houseController.joinToHouse = async (req, res) => {
  try {
    const { userId } = req;
    const { inviteCode } = req.body;

    const house = await House.findOne({ where: { invite_code: inviteCode } });
    if (!house) {
      return res
        .status(400)
        .json({ status: "fail", message: "유효하지 않은 코드 입니다." });
    }

    // 이미 가입된 집 정보 확인
    const existingUserHouse = await UserHouse.findOne({
      where: {
        house_id: house.id,
        user_id: userId,
      },
    });

    if (existingUserHouse) {
      return res.status(200).json({
        status: "success",
        message: "이미 이 집에 가입되어 있습니다.",
        data: existingUserHouse,
      });
    }

    // 새로운 집 가입
    let joinHouse = await UserHouse.create({
      house_id: house.id,
      user_id: userId,
      is_owner: false,
    });
    console.log("joinHouse", joinHouse);
    return res.status(200).json({
      status: "success",
      message: "초대코드를 통해 입장되었습니다.",
      data: joinHouse,
    });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = houseController;
