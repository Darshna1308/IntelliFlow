const Request = require("../models/Request");
const User = require("../models/User");

const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("createdBy", "name email role")
      .populate("assignedReviewer", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get all requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching all requests",
    });
  }
};

const getAvailableReviewers = async (req, res) => {
  try {
    const reviewers = await User.find({
      role: "REVIEWER",
      isActive: true,
    })
      .select("name email role")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: reviewers.length,
      reviewers,
    });
  } catch (error) {
    console.error("Get available reviewers error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching reviewers",
    });
  }
};

module.exports = {
  getAllRequests,
  getAvailableReviewers,
};