const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
  role: {
    type: String,
    enum: ["student", "admin", "alumni"],
    default: "student",
  },
  company: { type: String, default: "Not Specified" },
  position: { type: String, default: "Alumnus" },
  linkedin: { type: String, default: "" },
  isBanned: {
    type: Boolean,
    default: false,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
