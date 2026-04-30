const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const timeoutMs = Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 10000;

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set.");
    }

    let timeoutId;
    const connectionAttempt = mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: timeoutMs,
      serverSelectionTimeoutMS: timeoutMs,
      socketTimeoutMS: timeoutMs,
    });

    await Promise.race([
      connectionAttempt,
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`MongoDB connection timed out after ${timeoutMs}ms.`)),
          timeoutMs,
        );
      }),
    ]);

    clearTimeout(timeoutId);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
