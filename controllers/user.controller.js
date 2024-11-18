const User = require("../models/User");

const userController = {};

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
