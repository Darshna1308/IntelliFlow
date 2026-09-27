const express = require("express");

const {
  createRequest,
  getMyRequests,
  getRequestById,
} = require("../controllers/requestController");

const {
  updateRequestStatus,
} = require("../controllers/workflowController");

const {
  getRequestAuditLogs,
} = require("../controllers/auditController");

const {
  uploadDocument,
  getRequestDocuments,
} = require("../controllers/documentController");

const {
  createComment,
  getRequestComments,
} = require("../controllers/commentController");

const {
  assignReviewer,
} = require("../controllers/assignmentController");

const {
  getAssignedRequests,
} = require("../controllers/reviewerController");

const {
  getAllRequests,
  getAvailableReviewers,
} = require("../controllers/adminController");

const {
  getAdminAnalytics,
} = require("../controllers/analyticsController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  checkRequestAccess,
} = require("../middleware/requestAccessMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


/*
 * CREATE REQUEST
 */

router.post(
  "/",
  protect,
  authorize("USER"),
  createRequest
);


/*
 * USER REQUESTS
 */

router.get(
  "/my",
  protect,
  authorize("USER"),
  getMyRequests
);


/*
 * REVIEWER REQUESTS
 */

router.get(
  "/reviewer/assigned",
  protect,
  authorize("REVIEWER"),
  getAssignedRequests
);


/*
 * ADMIN REQUESTS
 */

router.get(
  "/admin/all",
  protect,
  authorize("ADMIN"),
  getAllRequests
);


router.get(
  "/admin/reviewers",
  protect,
  authorize("ADMIN"),
  getAvailableReviewers
);


router.get(
  "/admin/analytics",
  protect,
  authorize("ADMIN"),
  getAdminAnalytics
);


/*
 * ADMIN REVIEWER ASSIGNMENT
 */

router.patch(
  "/:id/assign-reviewer",
  protect,
  authorize("ADMIN"),
  assignReviewer
);


/*
 * REQUEST DETAILS
 *
 * Access:
 * USER     → own request
 * REVIEWER → assigned request
 * ADMIN    → all requests
 */

router.get(
  "/:id",
  protect,
  checkRequestAccess,
  getRequestById
);


/*
 * WORKFLOW STATUS
 */

router.patch(
  "/:id/status",
  protect,
  checkRequestAccess,
  updateRequestStatus
);


/*
 * AUDIT LOGS
 */

router.get(
  "/:id/audit-logs",
  protect,
  checkRequestAccess,
  getRequestAuditLogs
);


/*
 * DOCUMENTS
 */

router.get(
  "/:id/documents",
  protect,
  checkRequestAccess,
  getRequestDocuments
);


router.post(
  "/:id/documents",
  protect,
  checkRequestAccess,
  upload.single("document"),
  uploadDocument
);


/*
 * COMMENTS
 */

router.get(
  "/:id/comments",
  protect,
  checkRequestAccess,
  getRequestComments
);


router.post(
  "/:id/comments",
  protect,
  checkRequestAccess,
  createComment
);


module.exports = router;