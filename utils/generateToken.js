const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY;

// 사용자 인증을 위한 용도
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
    },
    JWT_SECRET_KEY,
    { expiresIn: "15m" }
  );
};

// accesstoken을 발급 받기 위한 용도
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
    },
    JWT_REFRESH_KEY,
    { expiresIn: "30d" }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
