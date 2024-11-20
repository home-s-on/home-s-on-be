const { sequelize, House, UserHouse } = require("../models");
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
    const userId = req.body.user_id;
    const inviteCode = randomStringGenerator();
    const house = await createHouseAndUserHouse(userId, inviteCode);

    res.status(201).json({
      message: "House created successfully",
      houseId: house.id,
      inviteCode: house.invite_code,
    });
  } catch (error) {
    console.error("Error creating house:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

houseController.getInviteCode = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const userHouse = await UserHouse.findOne({ where: { user_id: user_id } });
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
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = houseController;
