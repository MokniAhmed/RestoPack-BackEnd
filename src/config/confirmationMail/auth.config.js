const { email, accessSecret, password } = require("config/vars");

module.exports = {
  secret: accessSecret,
  user: email,
  pass: password,
  domain: "gmail.com",
};
