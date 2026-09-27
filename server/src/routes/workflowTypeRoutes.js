const express = require("express");

const {
  getWorkflowTypes,
  createWorkflowType,
} = require("../controllers/workflowTypeController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get all active workflow types
router.get(
  "/",
  protect,
  getWorkflowTypes
);


// Create a new workflow type
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  createWorkflowType
);


module.exports = router;