require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IntelliFlow API is running",
  });
});

app.listen(PORT, () => {
  console.log(`IntelliFlow server running on http://localhost:${PORT}`);
});