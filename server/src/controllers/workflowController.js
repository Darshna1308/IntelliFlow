const Request = require("../models/Request");
const {
  isValidTransition,
  getAllowedTransitions,
} = require("../services/workflowService");

const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "New status is required",
      });
    }

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (!isValidTransition(request.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${request.status} to ${status}`,
        allowedTransitions: getAllowedTransitions(request.status),
      });
    }

    const previousStatus = request.status;

    request.status = status;

    if (status === "SUBMITTED" && !request.submittedAt) {
      request.submittedAt = new Date();
    }

    if (status === "APPROVED" || status === "REJECTED") {
      request.completedAt = new Date();
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      request: {
        id: request._id,
        requestId: request.requestId,
        previousStatus,
        newStatus: request.status,
        submittedAt: request.submittedAt,
        completedAt: request.completedAt,
      },
    });
  } catch (error) {
    console.error("Update request status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while updating request status",
    });
  }
};

module.exports = {
  updateRequestStatus,
};