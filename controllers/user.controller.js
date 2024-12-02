const { User } = require("../models");
const bcrypt = require("bcryptjs");

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

    const user = await User.findOne({ where: { id: userId } });
    await user.addDeviceToken(deviceToken);
    return res
      .status(200)
      .json({
        status: "success",
        message: "디바이스 토큰이 성공적으로 업데이트 되었습니다.",
        data: user,
      });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = userController;
