const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/email", authController.loginWithEmail);
router.post("/apple", authController.loginWithApple);
router.post("/kakao", authController.loginWithKakao);
router.post("/google", authController.loginWithGoogle);

module.exports = router;
