const express = require("express");

const {
  createRequest,
  getMyRequests,
  getRequestById,
} = require("../controllers/requestController");

const {
  updateRequestStatus,
} = require("../controllers/workflowController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new request
router.post("/", protect, createRequest);

// Get requests created by the logged-in user
router.get("/my", protect, getMyRequests);

// Update request workflow status
router.patch("/:id/status", protect, updateRequestStatus);

// Get a specific request
router.get("/:id", protect, getRequestById);

module.exports = router;