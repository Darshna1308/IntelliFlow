const express = require("express");

const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IntelliFlow API is running",
  });
});

app.listen(PORT, () => {
  console.log(`IntelliFlow server running on http://localhost:${PORT}`);
});