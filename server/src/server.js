require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const workflowTypeRoutes = require("./routes/workflowTypeRoutes");

const app = express();

const PORT =
  process.env.PORT || 5000;


// Connect to MongoDB
connectDB();


// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());


// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IntelliFlow API is running",
  });
});


app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/requests",
  requestRoutes
);


app.use(
  "/api/workflow-types",
  workflowTypeRoutes
);


// Start server
app.listen(
  PORT,
  () => {
    console.log(
      `IntelliFlow server running on http://localhost:${PORT}`
    );
  }
);