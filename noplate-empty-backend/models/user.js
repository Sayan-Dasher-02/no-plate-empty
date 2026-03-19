const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["SUPER_ADMIN", "DONOR", "NGO"],
    required: true
  },

  isApproved: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
  rejectedAt: { type: Date, default: null },
  rejectionDeleteAt: { type: Date, default: null }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
