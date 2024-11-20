const { User } = require("../models");
const bcrypt = require("bcryptjs");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      throw new Error("이메일과 비밀번호는 필수입력값 입니다.");
    }

    const user = await User.findOne({ where: { email } });
    if (user) {
      throw new Error("동일한 이메일로 가입되어 있는 계정이 있습니다.");
    }
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    await User.create({
      email,
      password,
      nickname: email.split("@")[0],
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
    console.log("getUser", userId);
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

module.exports = userController;
