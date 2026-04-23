const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  login_time: {
    type: Date,
    default: Date.now,
  },
});

const LoginHistory =
  mongoose.models.LoginHistory ||
  mongoose.model("LoginHistory", loginHistorySchema, "login_histories");

module.exports = LoginHistory;
