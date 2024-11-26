const bcrypt = require("bcryptjs");

const createPassword = async () => {
  const randomPassword = "" + Math.floor(Math.random() * 10000000);
  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(randomPassword, salt);
  return newPassword;
};

module.exports = { createPassword };
