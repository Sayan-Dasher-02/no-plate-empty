const app = require("./app");
const connectDB = require("./config/db");

app.use("/api/v1/category", require("./routes/categoryRoutes"));
app.use("/api/v1/Doner", require("./routes/DonerRoutes"));
app.use("/api/v1/food", require("./routes/foodRoutes"));

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    console.error(error);
    process.exit(1);
  }
};

startServer();