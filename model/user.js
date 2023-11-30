//define a User model
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  isFroud: {
    type: Boolean,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
