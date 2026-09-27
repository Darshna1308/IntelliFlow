const Request = require("../models/Request");

const {
  calculateIntelligence,
} = require("../services/intelligenceService");

const getAssignedRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await Request.find({
        assignedReviewer:
          req.user.userId,
      })
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "assignedReviewer",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    const enrichedRequests =
      requests.map(
        (request) => ({
          ...request.toObject(),
          intelligence:
            calculateIntelligence(
              request
            ),
        })
      );

    return res.status(200).json({
      success: true,
      count:
        enrichedRequests.length,
      requests:
        enrichedRequests,
    });
  } catch (error) {
    console.error(
      "Get assigned requests error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching assigned requests",
    });
  }
};

module.exports = {
  getAssignedRequests,
};