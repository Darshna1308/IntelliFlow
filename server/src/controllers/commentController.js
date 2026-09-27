const Comment = require("../models/Comment");


const createComment = async (
  req,
  res
) => {
  try {

    const request =
      req.workflowRequest;

    const {
      message,
      type,
    } = req.body;


    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }


    if (
      !message ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Comment message is required",
      });
    }


    const allowedTypes = [
      "GENERAL",
      "REVISION",
      "APPROVAL",
      "REJECTION",
    ];


    const commentType =
      type || "GENERAL";


    if (
      !allowedTypes.includes(
        commentType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid comment type",
        allowedTypes,
      });
    }


    const comment =
      await Comment.create({
        requestId:
          request._id,

        userId:
          req.user.userId,

        message:
          message.trim(),

        type:
          commentType,
      });


    const populatedComment =
      await Comment.findById(
        comment._id
      ).populate(
        "userId",
        "name email role"
      );


    return res.status(201).json({
      success: true,
      message:
        "Comment added successfully",
      comment:
        populatedComment,
    });

  } catch (error) {

    console.error(
      "Create comment error:",
      error.message
    );


    return res.status(500).json({
      success: false,
      message:
        "Server error while creating comment",
    });
  }
};


const getRequestComments = async (
  req,
  res
) => {
  try {

    const request =
      req.workflowRequest;


    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }


    const comments =
      await Comment.find({
        requestId:
          request._id,
      })
        .populate(
          "userId",
          "name email role"
        )
        .sort({
          createdAt: 1,
        });


    return res.status(200).json({
      success: true,
      count:
        comments.length,
      comments,
    });

  } catch (error) {

    console.error(
      "Get request comments error:",
      error.message
    );


    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching comments",
    });
  }
};


module.exports = {
  createComment,
  getRequestComments,
};