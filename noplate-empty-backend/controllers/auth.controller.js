const User = require("../models/user");
const RevokedToken = require("../models/RevokedToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  buildRejectedMessage,
  isRejectedExpired
} = require("../utils/rejectedUserPolicy");

const deleteRejectedUserIfExpired = async (user) => {
  if (!user || !isRejectedExpired(user)) {
    return false;
  }

  await User.findByIdAndDelete(user._id);
  return true;
};

/*
 =========================
 REGISTER USER
 =========================
*/
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // 2. Check duplicate email
    let existingUser = await User.findOne({ email });

    if (await deleteRejectedUserIfExpired(existingUser)) {
      existingUser = null;
    }

    if (existingUser) {
      if (existingUser.isRejected) {
        return res.status(403).json({
          message: buildRejectedMessage(existingUser)
        });
      }

      return res.status(400).json({
        message: "User already exists"
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved: role === "SUPER_ADMIN", // only admin auto-approved
      isRejected: false,
      rejectedAt: null,
      rejectionDeleteAt: null
    });

    res.status(201).json({
      message: "Registered successfully. Await admin approval.",
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
};

/*
 =========================
 LOGIN USER
 =========================
*/
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isRejected) {
      if (await deleteRejectedUserIfExpired(user)) {
        return res.status(410).json({
          message: "Your rejected registration has been deleted. Please register again."
        });
      }

      return res.status(403).json({
        message: buildRejectedMessage(user)
      });
    }

    if (!user.isApproved && user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Approval pending" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
};

/*
 =========================
 GET CURRENT USER
 =========================
*/
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message
    });
  }
};

/*
 =========================
 UPDATE CURRENT USER
 =========================
*/
exports.updateCurrentUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({
        message: "At least one field is required"
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isBlocked: user.isBlocked,
        isRejected: user.isRejected,
        rejectedAt: user.rejectedAt,
        rejectionDeleteAt: user.rejectionDeleteAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user",
      error: error.message
    });
  }
};

/*
 =========================
 RESET PASSWORD
 =========================
*/
exports.resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long"
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reset password",
      error: error.message
    });
  }
};

/*
 =========================
 LOGOUT USER
 =========================
*/
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: "Invalid token" });
    }

    await RevokedToken.findOneAndUpdate(
      { token },
      { token, expiresAt: new Date(decoded.exp * 1000) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Signed out successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to sign out",
      error: error.message
    });
  }
};

/*
 =========================
 DELETE CURRENT USER
 =========================
*/
exports.deleteCurrentUser = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required to delete the account"
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await User.findByIdAndDelete(user._id);

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.decode(token);

      if (decoded && decoded.exp) {
        await RevokedToken.findOneAndUpdate(
          { token },
          { token, expiresAt: new Date(decoded.exp * 1000) },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message
    });
  }
};
