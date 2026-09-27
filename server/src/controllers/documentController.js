const Document = require("../models/Document");


const uploadDocument = async (
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


    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a file to upload",
      });
    }


    const document =
      await Document.create({
        requestId:
          request._id,

        uploadedBy:
          req.user.userId,

        originalName:
          req.file.originalname,

        storedName:
          req.file.filename,

        mimeType:
          req.file.mimetype,

        size:
          req.file.size,

        path:
          req.file.path,
      });


    return res.status(201).json({
      success: true,
      message:
        "Document uploaded successfully",
      document,
    });

  } catch (error) {

    console.error(
      "Upload document error:",
      error.message
    );


    return res.status(500).json({
      success: false,
      message:
        "Server error while uploading document",
    });
  }
};


const getRequestDocuments = async (
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


    const documents =
      await Document.find({
        requestId:
          request._id,
      })
        .populate(
          "uploadedBy",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({
      success: true,
      count:
        documents.length,
      documents,
    });

  } catch (error) {

    console.error(
      "Get request documents error:",
      error.message
    );


    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching documents",
    });
  }
};


module.exports = {
  uploadDocument,
  getRequestDocuments,
};