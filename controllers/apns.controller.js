const { where } = require("sequelize");
const { User } = require("../models");
const apn = require("apn");

const apnsController = {};

apnsController.initializeApnProvider = () => {
  var option = {
    token: {
      key: process.env.KEY,
      keyId: process.env.KEY_ID,
      teamId: process.env.TEAM_ID,
    },
    production: false,
  };
  console.log("KEY:", process.env.KEY);
  console.log("KEY_ID:", process.env.KEY_ID);
  console.log("TEAM_ID:", process.env.TEAM_ID);
  return new apn.Provider(option);
};

async function validateTokenWithPushTest(token) {
  // try {
  //   const response = await sendTestPushNotification(token);
  //   return response.status === 200;
  // } catch (error) {
  //   if (error.response?.status === 400) {
  //     await removeInvalidToken(token);
  //     return false;
  //   }
  //   throw error;
  // }
}

apnsController.sendPushNotification = async (req, res) => {
  if (!apnsController.apnProvider) {
    apnsController.apnProvider = apnsController.initializeApnProvider();
  }

  const { assigneeId, title, subtitle, body } = req.body;
  const deviceTokens = [];

  for (const userId of assigneeId) {
    const user = await User.findOne({
      where: { id: userId },
      attributes: ["deviceTokens"],
    });

    if (user && user.deviceTokens) {
      deviceTokens.push(user.deviceTokens);
    }
  }

  //const deviceTokens = Array.isArray(deviceToken) ? deviceToken : [deviceToken];
  // [req.body.deviceToken]; //여러개 보내고 싶으면 여기에 담아서
  console.log("Device Tokens:", deviceTokens);

  //토큰 유효성 검사
  validateTokenWithPushTest(deviceTokens[0]);

  const noti = new apn.Notification();
  noti.alert = { title, subtitle, body };
  noti.sound = "default";
  noti.topic = process.env.APPLE_AUDIENCE;

  try {
    const result = await apnsController.apnProvider.send(noti, deviceTokens);
    console.log("result:", result);
    res.json({ success: true, message: "success push notification", result });
  } catch (error) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Push notification failed",
      details: error.message,
    });
  }
};

module.exports = apnsController;
