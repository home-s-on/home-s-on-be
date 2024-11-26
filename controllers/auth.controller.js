const { User, House } = require("../models");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { ClientBase } = require("pg");
const appleSignin = require("apple-signin-auth");
const axios = require("axios");
const { createPassword } = require("../utils/createPassword");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const APPLE_AUDIENCE = process.env.APPLE_AUDIENCE;

const authController = {};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;

    if (!tokenString) throw new Error("Token not found");
    const token = tokenString.replace("Bearer ", "");
    const payload = await new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET_KEY, (error, decoded) => {
        if (error) reject(new Error("Invalid token"));
        resolve(decoded);
      });
    });
    req.userId = payload.id;

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
        const token = await user.generateToken();
        console.log("이메일 로그인 성공");
        return res
          .status(200)
          .json({ status: "success", data: { user, token } });
      }
    }

    throw new Error("이메일 또는 비밀번호가 유효하지 않습니다.");
  } catch (e) {
    res.status(400).json({ status: "fail", message: e.message });
  }
};

authController.loginWithApple = async (req, res) => {
  try {
    const { authorization } = req.body;

    const { sub: userAppleId } = await appleSignin.verifyIdToken(
      authorization.id_token,
      {
        audience: APPLE_AUDIENCE,
        ignoreExpiration: true,
      }
    );

    let user = await User.findOne({
      where: { email: userAppleId, social_login_type: "APPLE" },
    });
    if (!user) {
      const newPassword = await createPassword();
      user = await User.create({
        email: userAppleId,
        password: newPassword,
        social_login_type: "APPLE",
      });
    }

    const sessionToken = await user.generateToken();
    return res
      .status(200)
      .json({ status: "success", data: { user, token: sessionToken } });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

authController.loginWithKakao = async (req, res) => {
  try {
    const { token } = req.body;
    const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const kakaoEmail = response.data.kakao_account.email;

    let user = await User.findOne({
      where: { email: kakaoEmail, social_login_type: "KAKAO" },
    });
    if (!user) {
      const newPassword = await createPassword();
      user = await User.create({
        email: kakaoEmail,
        password: newPassword,
        social_login_type: "KAKAO",
      });
    }

    const sessionToken = await user.generateToken();
    return res
      .status(200)
      .json({ status: "success", data: { user, token: sessionToken } });
  } catch (e) {
    return res.status(400).json({ status: "fail", message: e.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      requiredAudience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    let user = await User.findOne({
      where: { id: email, social_login_type: "GOOGLE" },
    });
    if (!user) {
      // 처음 로그인 시도한 유저면 유저정보 새로 생성 후 토큰 값 주기
      const newPassword = await createPassword();
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
