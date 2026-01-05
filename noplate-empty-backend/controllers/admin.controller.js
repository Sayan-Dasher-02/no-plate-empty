const User = require("../models/User");

/*
 =========================
 GET ALL PENDING USERS
 =========================
*/
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      isApproved: false,
      role: { $ne: "SUPER_ADMIN" }
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
 =========================
 APPROVE USER
 =========================
*/
exports.approveUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isApproved: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User approved successfully",
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
