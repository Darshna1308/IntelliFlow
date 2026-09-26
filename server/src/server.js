require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IntelliFlow API is running",
  });
});

app.listen(PORT, () => {
  console.log(`IntelliFlow server running on http://localhost:${PORT}`);
});