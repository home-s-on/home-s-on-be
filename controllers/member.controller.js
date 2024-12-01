const { Member } = require("../models");

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

module.exports = memberController;
