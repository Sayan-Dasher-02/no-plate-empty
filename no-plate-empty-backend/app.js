const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const configuredOrigins = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  ...configuredOrigins,
];

const isLocalDevelopmentOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin);
    return (
      process.env.NODE_ENV !== "production" &&
      protocol === "http:" &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === "production") return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (isLocalDevelopmentOrigin(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "backend" });
});

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(
    __dirname,
    "..",
    "no-plate-empty-frontend",
    "dist"
  );
  const clientIndexPath = path.join(clientBuildPath, "index.html");

  if (fs.existsSync(clientIndexPath)) {
    app.use(express.static(clientBuildPath));

    app.get(/.*/, (req, res) => {
      res.sendFile(clientIndexPath);
    });
  } else {
    app.get("/", (req, res) => {
      res.json({ status: "ok", service: "backend" });
    });
  }
}

module.exports = app;
