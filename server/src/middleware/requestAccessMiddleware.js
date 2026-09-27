const Request = require("../models/Request");


const checkRequestAccess = async (
  req,
  res,
  next
) => {
  try {

    const requestId =
      req.params.id;


    const request =
      await Request.findById(
        requestId
      );


    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }


    const userId =
      req.user.userId.toString();


    const creatorId =
      request.createdBy
        ?.toString();


    const reviewerId =
      request.assignedReviewer
        ?.toString();


    const isAdmin =
      req.user.role ===
      "ADMIN";


    const isCreator =
      creatorId ===
      userId;


    const isAssignedReviewer =
      reviewerId ===
      userId;


    if (
      !isAdmin &&
      !isCreator &&
      !isAssignedReviewer
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this request",
      });
    }


    req.workflowRequest =
      request;


    next();

  } catch (error) {

    console.error(
      "Request access check error:",
      error.message
    );


    return res.status(500).json({
      success: false,
      message:
        "Server error while checking request access",
    });
  }
};


module.exports = {
  checkRequestAccess,
};