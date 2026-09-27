const Request = require("../models/Request");
const User = require("../models/User");
const { createAuditLog } = require("../services/auditService");

const assignReviewer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerId } = req.body;

    if (!reviewerId) {
      return res.status(400).json({
        success: false,
        message: "Reviewer ID is required",
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const reviewer = await User.findOne({
      _id: reviewerId,
      role: "REVIEWER",
      isActive: true,
    });

    if (!reviewer) {
      return res.status(404).json({
        success: false,
        message: "Active reviewer not found",
      });
    }

    const previousReviewer = request.assignedReviewer;

    request.assignedReviewer = reviewer._id;

    await request.save();

    await createAuditLog({
      requestId: request._id,
      userId: req.user.userId,
      action: "REVIEWER_ASSIGNED",
      description: `Reviewer assigned to request ${request.requestId}`,
      metadata: {
        requestId: request.requestId,
        previousReviewer: previousReviewer
          ? previousReviewer.toString()
          : null,
        newReviewer: reviewer._id.toString(),
      },
    });

    const updatedRequest = await Request.findById(request._id)
      .populate("createdBy", "name email role")
      .populate("assignedReviewer", "name email role");

    return res.status(200).json({
      success: true,
      message: "Reviewer assigned successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Assign reviewer error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while assigning reviewer",
    });
  }
};

module.exports = {
  assignReviewer,
};