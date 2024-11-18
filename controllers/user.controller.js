const { User } = require("../models");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    // 요청 본문에서 데이터 추출
    const {
      nickname,
      profile_img_url,
      social_login_type,
      password,
      account_id,
    } = req.body;

    // 필수 값들 체크
    if (
      !nickname ||
      !profile_img_url ||
      !social_login_type ||
      !password ||
      !account_id
    ) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    // 새 사용자 생성
    const newUser = await User.create({
      nickname,
      profile_img_url,
      social_login_type,
      password,
      account_id,
    });

    // 성공 응답
    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: newUser,
    });
  } catch (e) {
    // 예외 처리
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = userController;
