const express = require("express");
const router = express.Router();
const upload = require("../utils/uploadImage");
router.post("/", upload.single("photo"));
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser);
router.put(
  "/",
  authController.authenticate,
  upload.single("photo"),
  userController.updateUser
);
router.post(
  "/update-device-token",
  authController.authenticate,
  userController.updateDeviceToekn
);
router.get("/", authController.authenticate, userController.accountBasedEntry);

module.exports = router;
