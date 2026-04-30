const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/user");

const main = async () => {
  const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  const adminName = process.env.ADMIN_NAME || "Super Admin";

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is required.");
  }

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  await mongoose.connect(MONGO_URI);

  if (process.env.RESET_EXISTING_SUPER_ADMINS === "true") {
    const result = await User.deleteMany({
      role: "SUPER_ADMIN",
      email: { $ne: ADMIN_EMAIL },
    });

    console.log(`Removed ${result.deletedCount} previous super admin account(s).`);
  }

  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: adminName,
      email: ADMIN_EMAIL,
      password,
      role: "SUPER_ADMIN",
      isApproved: true,
      isBlocked: false,
      isRejected: false,
      rejectedAt: null,
      rejectionDeleteAt: null,
    },
    { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true },
  );

  console.log(`Super admin ready: ${admin.email}`);
};

main()
  .catch((error) => {
    console.error(`Failed to seed super admin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
