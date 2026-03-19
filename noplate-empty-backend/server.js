const app = require("./app");
const connectDB = require("./config/db");

connectDB();

app.use("/api/v1/category", require("./routes/categoryRoutes"));
app.use("/api/v1/Doner", require("./routes/DonerRoutes"));
app.use("/api/v1/food", require("./routes/foodRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
