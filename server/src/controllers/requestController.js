const Request = require("../models/Request");
const WorkflowType = require("../models/WorkflowType");

const {
  calculateIntelligence,
} = require("../services/intelligenceService");

const {
  getNextSequence,
} = require("../services/counterService");


const createRequest = async (
  req,
  res
) => {
  try {

    const {
      type,
      title,
      description,
      priority,
      dueDate,
      assignedReviewer,
    } = req.body;


    /*
     * BASIC VALIDATION
     */

    if (
      !type ||
      !title ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Type, title, and description are required",
      });
    }


    /*
     * FIND ACTIVE WORKFLOW TYPE
     */

    const workflowType =
      await WorkflowType.findOne({
        name:
          type.trim(),

        active:
          true,
      });


    if (!workflowType) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or inactive workflow type",
      });
    }


    /*
     * GENERATE CONCURRENCY-SAFE
     * REQUEST SEQUENCE
     */

    const sequence =
      await getNextSequence(
        "request"
      );


    const requestId =
      `REQ-${String(
        sequence
      ).padStart(5, "0")}`;


    /*
     * CALCULATE DEFAULT DEADLINE
     */

    let calculatedDueDate =
      dueDate || null;


    if (
      !calculatedDueDate &&
      workflowType.defaultDueDays
    ) {

      const defaultDate =
        new Date();


      defaultDate.setDate(
        defaultDate.getDate() +
          workflowType.defaultDueDays
      );


      calculatedDueDate =
        defaultDate;
    }


    /*
     * WORKFLOW DEFAULT PRIORITY
     */

    const workflowDefaultPriority =
      workflowType.defaultPriority ||
      "MEDIUM";


    /*
     * PRIORITY
     */

    const calculatedPriority =
      priority ||
      workflowDefaultPriority;


    /*
     * CREATE REQUEST
     */

    const request =
      await Request.create({

        requestId,

        type:
          workflowType.name,

        title:
          title.trim(),

        description:
          description.trim(),

        createdBy:
          req.user.userId,

        assignedReviewer:
          assignedReviewer ||
          null,

        priority:
          calculatedPriority,

        workflowDefaultPriority,

        status:
          "DRAFT",

        dueDate:
          calculatedDueDate,

        stageChangedAt:
          new Date(),
      });


    return res.status(201).json({
      success: true,

      message:
        "Request created successfully",

      request,
    });

  } catch (error) {

    console.error(
      "Create request error:",
      error.message
    );


    return res.status(500).json({
      success: false,
      message:
        "Server error while creating request",
    });
  }
};


const getMyRequests = async (
  req,
  res
) => {
  try {

    const requests =
      await Request.find({
        createdBy:
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
      "Get my requests error:",
      error.message
    );


    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching requests",
    });
  }
};


const getRequestById = async (
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


    const populatedRequest =
      await Request.findById(
        request._id
      )
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "assignedReviewer",
          "name email role"
        );


    if (!populatedRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }


    const intelligence =
      calculateIntelligence(
        populatedRequest
      );


    return res.status(200).json({
      success: true,

      request: {
        ...populatedRequest.toObject(),

        intelligence,
      },
    });

  } catch (error) {

    console.error(
      "Get request error:",
      error.message
    );


    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching request",
    });
  }
};


module.exports = {
  createRequest,
  getMyRequests,
  getRequestById,
};