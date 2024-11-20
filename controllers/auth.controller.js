const { User } = require("../models");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { ClientBase } = require("pg");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const authController = {};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) throw new Error("Token not found");
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) throw new Error("invalid token");
      req.userId = payload.userId;
    });
    next();
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const social_login_type = "EMAIL";
    let user = await User.findOne({ where: { email, social_login_type } });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // token
        const token = await user.generateToken();
        return res.status(200).json({ status: "success", user, token });
      }
    }
    throw new Error("invalid email or password");
  } catch (e) {
    res.status(400).json({ status: "fail", message: e.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    console.log(googleClient);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      requiredAudience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ where: { account_id: email } });
    if (!user) {
      // 처음 로그인 시도한 유저면 유저정보 새로 생성 후 토큰 값 주기
      const randomPassword = "" + Math.floor(Math.random() * 10000000);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = await User.create({
        email,
        password: newPassword,
        social_login_type: "GOOGLE",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return res
      .status(200)
      .json({ status: "success", user, accessToken, refreshToken });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

module.exports = authController;
