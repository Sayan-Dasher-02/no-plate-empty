const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
  getPendingUsers,
  approveUser
} = require("../controllers/admin.controller");

// ALL admin routes are protected
router.use(auth, role("SUPER_ADMIN"));

router.get("/pending-users", getPendingUsers);
router.patch("/approve/:id", approveUser);

module.exports = router;
