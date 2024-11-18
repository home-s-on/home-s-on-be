const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routers/index");
const app = express();
require("dotenv").config();
const models = require("./models");
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", indexRouter);

app.listen(PORT, () => {
  models.sequelize
    .sync({ force: false })
    .then(() => {
      console.log("db 연결 성공");
    })
    .catch((err) => {
      console.log(`db 연결 실패 : ${err}`);
      process.exit();
    });
  console.log(`server on ${PORT}`);
});
