const { User, UserHouse, Member, House } = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      throw new Error("이메일과 비밀번호는 필수 입력값 입니다.");
    }

    const user = await User.findOne({
      where: { email, social_login_type: "EMAIL" },
    });
    if (user) {
      throw new Error("동일한 이메일로 가입되어 있는 계정이 있습니다.");
    }
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    await User.create({
      email,
      password,
      social_login_type: "EMAIL",
    });

    return res.status(201).json({ status: "success" });
  } catch (e) {
    res.status(400).json({ status: "fail", message: e.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    // console.log("getUser", userId);
    const user = await User.findOne({
      where: { id: userId },
    });

    if (user) {
      return res.status(200).json({ status: "success", user });
    }
    throw new Error("invalid token");
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

userController.updateUser = async (req, res) => {
  try {
    const { userId } = req;
    const { nickname } = req.body;
    const newProfile = req.body;
    newProfile.photo = req.filename;

    if (!nickname || !newProfile.photo) {
      return res.status(400).json({
        status: "fail",
        message: "닉네임과 프로필은 필수 입력값입니다.",
      });
    }

    const [updatedRows] = await User.update(newProfile, {
      where: { id: userId },
    });

    if (updatedRows) {
      const updatedUser = await User.findOne({ where: { id: userId } });
      return res.status(200).json({
        status: "success",
        message: "프로필 업데이트 성공",
        data: updatedUser,
      });
    }

    return res
      .status(404)
      .json({ status: "fail", message: "유저를 찾을 수 없습니다." });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

userController.updateDeviceToekn = async (req, res) => {
  try {
    const { userId } = req;
    const { deviceToken } = req.body;
    console.log("deviceToken", deviceToken);

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: "fail", message: "사용자를 찾을 수 없습니다."});
    }
    
    await user.addDeviceToken(deviceToken);

      const updatedUser = await User.findOne({where: { id: userId }})
      return res.status(200).json({
        status: "success",
        message: "디바이스 토큰이 성공적으로 업데이트 되었습니다.",
        data: updatedUser,
      });

  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

userController.accountBasedEntry = async (req, res) => {
  try {
    const { userId } = req;

    const existingUserHouse = await UserHouse.findOne({
      where: { user_id: userId },
    });

    if (!existingUserHouse) {
      return res
        .status(200)
        .json({ status: "success", message: "profile 뷰로 진입합니다." });
    }

    const existingMembers = await Member.findOne({
      where: {
        members_id: {
          [Op.contains]: [userId],
        },
      },
      include: [
        {
          model: House,
          attributes: ["invite_code"],
        },
      ],
    });

    if (existingMembers) {
      return res.status(200).json({
        status: "success",
        message: "main 뷰로 진입합니다.",
        data: existingMembers,
      });
    }

    // userHouse에서 house_id 추출
    const houseId = existingUserHouse.house_id;

    // house_id에 해당하는 house에서 invite_code 찾기
    const house = await House.findOne({
      where: { id: houseId },
      attributes: ["invite_code"],
    });

    // house가 없을 경우 처리
    if (!house) {
      return res.status(400).json({
        status: "fail",
        message: "해당 house 정보를 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "entry 뷰로 진입합니다.",
      house_id: houseId,
      invite_code: house.invite_code,
    });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = userController;
