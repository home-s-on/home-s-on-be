const express = require("express");
const router = express.Router();
const upload = require("../utils/uploadImage");
router.post("/", upload.single("profile_img_url"));
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser);
router.put(
  "/",
  authController.authenticate,
  upload.single("profile_img_url"),
  userController.updateUser
);

module.exports = router;
