const { User } = require("../models");
const bcrypt = require("bcryptjs");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ where: { email } });
    if (user) {
      throw new Error("User already exists");
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
    const user = await User.findOne({
      where: { user_id: userId },
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
