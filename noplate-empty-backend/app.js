const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");


const app = express();

app.use(express.json());
app.use(cors());


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
