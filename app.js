const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routers/index");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5001;

require("dotenv").config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", indexRouter);

app.listen(PORT, () => {
  // 여기에 나중에 db 연결도 해줘야 함
  console.log(`server on ${PORT}`);
});
