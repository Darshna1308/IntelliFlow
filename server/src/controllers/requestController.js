const Request = require("../models/Request");

const createRequest = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      priority,
      dueDate,
      assignedReviewer,
    } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Type, title, and description are required",
      });
    }

    const requestCount = await Request.countDocuments();

    const requestId = `REQ-${String(requestCount + 1).padStart(5, "0")}`;

    const request = await Request.create({
      requestId,
      type,
      title,
      description,
      createdBy: req.user.userId,
      assignedReviewer: assignedReviewer || null,
      priority: priority || "MEDIUM",
      status: "DRAFT",
      dueDate: dueDate || null,
    });

    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      request,
    });
  } catch (error) {
    console.error("Create request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while creating request",
    });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      createdBy: req.user.userId,
    })
      .populate("createdBy", "name email role")
      .populate("assignedReviewer", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching requests",
    });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("assignedReviewer", "name email role");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching request",
    });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getRequestById,
};