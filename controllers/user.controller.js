const userController = {};

userController.createUser = async (req, res) => {
  try {
  } catch (e) {
    res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = userController;
