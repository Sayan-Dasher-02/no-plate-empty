const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

const app = require("../app");
const User = require("../models/user");
const RevokedToken = require("../models/RevokedToken");

let API = process.env.SMOKE_API_BASE_URL;
let server = null;
const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const password = `SmokePass-${runId}`;
const donorEmail = `smoke-donor-${runId}@example.test`;
const ngoEmail = `smoke-ngo-${runId}@example.test`;
const adminEmail = `smoke-admin-${runId}@example.test`;

const state = {
  donorId: null,
  ngoId: null,
  adminId: null,
  tokens: [],
};

const print = (status, label, detail = "") => {
  const suffix = detail ? ` - ${detail}` : "";
  console.log(`${status} ${label}${suffix}`);
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  return { response, payload };
};

const expectStatus = async (label, path, options, expectedStatus) => {
  const result = await request(path, options);

  if (result.response.status !== expectedStatus) {
    throw new Error(
      `${label} expected ${expectedStatus}, got ${result.response.status}: ${JSON.stringify(result.payload)}`,
    );
  }

  print("PASS", label, `status ${expectedStatus}`);
  return result.payload;
};

const login = async (label, email, expectedStatus = 200, passwordOverride = password) => {
  const payload = await expectStatus(
    label,
    "/api/auth/login",
    {
      method: "POST",
      body: { email, password: passwordOverride },
    },
    expectedStatus,
  );

  if (expectedStatus === 200) {
    if (!payload.token || !payload.role) {
      throw new Error(`${label} did not return token and role.`);
    }

    state.tokens.push(payload.token);
  }

  return payload;
};

const cleanup = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  const ids = [state.donorId, state.ngoId, state.adminId].filter(Boolean);

  if (ids.length > 0) {
    await User.deleteMany({ _id: { $in: ids } });
  }

  if (state.tokens.length > 0) {
    await RevokedToken.deleteMany({ token: { $in: state.tokens } });
  }
};

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  if (!API) {
    app.use("/api/v1/category", require("../routes/categoryRoutes"));
    app.use("/api/v1/Doner", require("../routes/DonerRoutes"));
    app.use("/api/v1/food", require("../routes/foodRoutes"));

    await new Promise((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        API = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  }

  try {
    const categories = await expectStatus(
      "public category list",
      "/api/v1/category/getAll",
      {},
      200,
    );

    if (!Array.isArray(categories.categories)) {
      throw new Error("public category list did not return categories array.");
    }

    const donor = await expectStatus(
      "donor registration",
      "/api/auth/register",
      {
        method: "POST",
        body: {
          name: "Smoke Donor",
          email: donorEmail,
          password,
          role: "DONOR",
        },
      },
      201,
    );
    state.donorId = donor.userId;

    await expectStatus(
      "duplicate donor registration",
      "/api/auth/register",
      {
        method: "POST",
        body: {
          name: "Smoke Donor",
          email: donorEmail,
          password,
          role: "DONOR",
        },
      },
      400,
    );

    const ngo = await expectStatus(
      "ngo registration",
      "/api/auth/register",
      {
        method: "POST",
        body: {
          name: "Smoke NGO",
          email: ngoEmail,
          password,
          role: "NGO",
          location: {
            city: "Bhubaneswar",
            state: "Odisha",
            pincode: "751024",
            latitude: 20.2961,
            longitude: 85.8245,
          },
          searchRadiusKm: 15,
        },
      },
      201,
    );
    state.ngoId = ngo.userId;

    await login("pending donor login is blocked", donorEmail, 403);
    await login("pending ngo login is blocked", ngoEmail, 403);

    await expectStatus(
      "public super admin registration is rejected",
      "/api/auth/register",
      {
        method: "POST",
        body: {
          name: "Unsafe Admin",
          email: `unsafe-admin-${runId}@example.test`,
          password,
          role: "SUPER_ADMIN",
        },
      },
      400,
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name: "Smoke Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isApproved: true,
    });
    state.adminId = admin._id;

    const adminLogin = await login("admin login", adminEmail);
    if (adminLogin.role !== "SUPER_ADMIN") {
      throw new Error("admin login returned wrong role.");
    }

    const adminMe = await expectStatus(
      "admin current user",
      "/api/auth/me",
      { token: adminLogin.token },
      200,
    );

    if (adminMe.role !== "SUPER_ADMIN") {
      throw new Error("admin /me returned wrong role.");
    }

    const pendingUsers = await expectStatus(
      "admin pending users",
      "/api/admin/pending-users",
      { token: adminLogin.token },
      200,
    );

    const pendingIds = pendingUsers.map((user) => user._id);
    if (!pendingIds.includes(state.donorId) || !pendingIds.includes(state.ngoId)) {
      throw new Error("pending users did not include both test registrations.");
    }

    await expectStatus(
      "approve donor",
      `/api/admin/approve/${state.donorId}`,
      { method: "PATCH", token: adminLogin.token },
      200,
    );

    await expectStatus(
      "approve ngo",
      `/api/admin/approve/${state.ngoId}`,
      { method: "PATCH", token: adminLogin.token },
      200,
    );

    await login("wrong password is rejected", donorEmail, 401, `${password}-wrong`);

    const donorLogin = await login("approved donor login", donorEmail);
    if (donorLogin.role !== "DONOR") {
      throw new Error("donor login returned wrong role.");
    }

    const donorMe = await expectStatus(
      "donor current user",
      "/api/auth/me",
      { token: donorLogin.token },
      200,
    );

    if (donorMe.role !== "DONOR" || !donorMe.isApproved) {
      throw new Error("donor /me returned unexpected approval or role.");
    }

    const ngoLogin = await login("approved ngo login", ngoEmail);
    if (ngoLogin.role !== "NGO") {
      throw new Error("ngo login returned wrong role.");
    }

    const ngoMe = await expectStatus(
      "ngo current user",
      "/api/auth/me",
      { token: ngoLogin.token },
      200,
    );

    if (ngoMe.role !== "NGO" || !ngoMe.isApproved || ngoMe.searchRadiusKm !== 15) {
      throw new Error("ngo /me returned unexpected approval, role, or radius.");
    }

    await expectStatus(
      "logout donor",
      "/api/auth/logout",
      { method: "POST", token: donorLogin.token },
      200,
    );

    await expectStatus(
      "revoked donor token rejected",
      "/api/auth/me",
      { token: donorLogin.token },
      401,
    );
  } finally {
    await cleanup();
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await mongoose.disconnect();
  }
};

main().catch(async (error) => {
  console.error(`FAIL ${error.message}`);

  try {
    await cleanup();
  } catch (cleanupError) {
    console.error(`FAIL cleanup failed: ${cleanupError.message}`);
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(() => resolve()));
    }
    await mongoose.disconnect();
  }

  process.exit(1);
});
