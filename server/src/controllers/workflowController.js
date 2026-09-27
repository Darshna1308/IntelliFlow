const {
  isValidTransition,
  getAllowedTransitions,
} = require("../services/workflowService");

const {
  createAuditLog,
} = require("../services/auditService");

const Comment = require("../models/Comment");


const updateRequestStatus = async (
  req,
  res
) => {
  try {

    const {
      status,
      comment,
    } = req.body;


    const request =
      req.workflowRequest;


    /*
     * REQUEST CHECK
     */

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }


    /*
     * STATUS CHECK
     */

    if (!status) {
      return res.status(400).json({
        success: false,
        message:
          "New status is required",
      });
    }


    /*
     * TRANSITION CHECK
     */

    if (
      !isValidTransition(
        request.status,
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid status transition from ${request.status} to ${status}`,

        allowedTransitions:
          getAllowedTransitions(
            request.status
          ),
      });
    }


    /*
     * USER ACTIONS
     */

    const userTransitions = [
      "SUBMITTED",
      "RESUBMITTED",
    ];


    /*
     * REVIEWER ACTIONS
     */

    const reviewerTransitions = [
      "UNDER_REVIEW",
      "APPROVED",
      "REJECTED",
      "CHANGES_REQUESTED",
    ];


    const isUserAction =
      userTransitions.includes(
        status
      );


    const isReviewerAction =
      reviewerTransitions.includes(
        status
      );


    /*
     * CREATOR ID
     */

    const creatorId =
      request.createdBy
        ?.toString();


    const currentUserId =
      req.user.userId
        ?.toString();


    const isRequestCreator =
      creatorId ===
      currentUserId;


    /*
     * USER PERMISSION
     */

    if (isUserAction) {

      if (
        req.user.role !==
        "USER"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only the request creator can perform this action",
        });
      }


      if (
        !isRequestCreator
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only the request creator can perform this action",
        });
      }
    }


    /*
     * REVIEWER PERMISSION
     */

    if (
      isReviewerAction
    ) {

      if (
        req.user.role !==
        "REVIEWER"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only an authorized reviewer can perform this action",
        });
      }


      const assignedReviewerId =
        request.assignedReviewer
          ?.toString();


      const isAssignedReviewer =
        assignedReviewerId ===
        currentUserId;


      if (
        !isAssignedReviewer
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only the assigned reviewer can perform this action",
        });
      }
    }


    /*
     * REVIEW COMMENTS
     */

    const reviewCommentTypes = {
      APPROVED:
        "APPROVAL",

      REJECTED:
        "REJECTION",

      CHANGES_REQUESTED:
        "REVISION",
    };


    const requiresComment =
      Object.prototype.hasOwnProperty.call(
        reviewCommentTypes,
        status
      );


    if (
      requiresComment &&
      (
        !comment ||
        !comment.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A review comment is required for this action",
      });
    }


    /*
     * STORE PREVIOUS STATUS
     */

    const previousStatus =
      request.status;


    /*
     * UPDATE STATUS
     */

    request.status =
      status;


    request.stageChangedAt =
      new Date();


    /*
     * SUBMISSION TIMESTAMP
     */

    if (
      status ===
        "SUBMITTED" &&
      !request.submittedAt
    ) {
      request.submittedAt =
        new Date();
    }


    /*
     * COMPLETION TIMESTAMP
     */

    if (
      status === "APPROVED" ||
      status === "REJECTED"
    ) {
      request.completedAt =
        new Date();
    }


    await request.save();


    /*
     * CREATE REVIEW COMMENT
     */

    let createdComment =
      null;


    if (
      requiresComment
    ) {

      createdComment =
        await Comment.create({
          requestId:
            request._id,

          userId:
            req.user.userId,

          message:
            comment.trim(),

          type:
            reviewCommentTypes[
              status
            ],
        });


      createdComment =
        await Comment.findById(
          createdComment._id
        ).populate(
          "userId",
          "name email role"
        );
    }


    /*
     * AUDIT LOG
     */

    await createAuditLog({
      requestId:
        request._id,

      userId:
        req.user.userId,

      action:
        "STATUS_CHANGED",

      previousStatus,

      newStatus:
        status,

      description:
        `Request status changed from ${previousStatus} to ${status}`,

      metadata: {
        requestId:
          request.requestId,

        performedByRole:
          req.user.role,

        commentType:
          requiresComment
            ? reviewCommentTypes[
                status
              ]
            : null,

        reviewCommentId:
          createdComment
            ? createdComment._id.toString()
            : null,

        stageChangedAt:
          request.stageChangedAt,
      },
    });


    /*
     * RESPONSE
     */

    return res.status(200).json({
      success: true,

      message:
        "Request status updated successfully",

      request: {
        id:
          request._id,

        requestId:
          request.requestId,

        previousStatus,

        newStatus:
          request.status,

        submittedAt:
          request.submittedAt,

        completedAt:
          request.completedAt,

        stageChangedAt:
          request.stageChangedAt,
      },

      comment:
        createdComment,
    });

  } catch (error) {

    console.error(
      "Update request status error:",
      error.message
    );


    return res.status(500).json({
      success: false,
      message:
        "Server error while updating request status",
    });
  }
};


module.exports = {
  updateRequestStatus,
};