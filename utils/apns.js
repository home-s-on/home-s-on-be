const express = require("express");
require("dotenv").config();

const apn = require("apn");
const router = express.Router();
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

apnProvider = apn.Provider(option);

var noti = new apn.Notification();
noti.sound = "default";
// noti.sound = ' bell.mp3';
//바꿀 수 있는 api만들기
noti.alert = {
  title: "APNS Test.",
  subtitle: "Push Notification Test",
  body: "본문입니다.",
};
noti.payload = { name: "홍길동" };
noti.topic = process.env.APPLE_AUDIENCE;
console.log(noti);
router.post("/", async (req, res) => {
  const deviceToken = [req.body.deviceToken]; //여러개 보내고 싶으면 여기에 담아서 req.body.deviceToken,,,]
  // const deviceToken = [
  //   "8bc5ff6f845bd3386cb91e81a442b5e88b3a14abd5eea724e62b48bad332b2b7",
  //   "ab7b6581aa02a57292209378da412023f7c74fe30692373770f9c1f7a164a01d",
  // ];
  console.log(req.body.deviceToken);
  apnProvider
    .send(noti, deviceToken)
    .then((result) => {
      console.log("result:" + result);
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
});

module.exports = router;
