const { Member, User, UserHouse } = require("../models");

const memberController = {};

memberController.joinToMember = async (req, res) => {
  try {
    const { userId } = req;
    const houseId = parseInt(req.params.houseId);
    let existingMember = await Member.findOne({
      where: { house_id: houseId },
    });

    if (existingMember) {
      if (!existingMember.members_id.includes(userId)) {
        existingMember.members_id = [...existingMember.members_id, userId];
        await existingMember.save();
      }
    } else {
      existingMember = await Member.create({
        house_id: houseId,
        members_id: [userId],
      });
    }
    return res.status(200).json({
      status: "success",
      message: "멤버로 등록되었습니다.",
      data: existingMember,
    });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

memberController.getMembersInHouse = async (req, res) => {
  try {
    const houseId = parseInt(req.params.houseId);

    const member = await Member.findOne({
      where: { house_id: houseId },
    });

    if (!member) {
      return res
        .status(404)
        .json({ status: "fail", message: "해당 집의 멤버가 없습니다." });
    }

    // 2. members_id에서 사용자 정보 가져오기
    const membersNicknames = await Promise.all(
      member.members_id.map(async (userId) => {
        const user = await User.findOne({
          where: { id: userId },
          attributes: ["nickname"], // nickname만 선택
        });

        // 3. UserHouse에서 is_owner 값 가져오기
        const userHouse = await UserHouse.findOne({
          where: { user_id: userId, house_id: houseId },
          attributes: ["is_owner"], // is_owner만 선택
        });

        return {
          userId,
          nickname: user ? user.nickname : null,
          isOwner: userHouse ? userHouse.is_owner : false,
        };
      })
    );

    return res.status(200).json({
      status: "success",
      data: membersNicknames,
    });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = memberController;
