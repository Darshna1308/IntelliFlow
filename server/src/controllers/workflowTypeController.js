const WorkflowType = require("../models/WorkflowType");

const getWorkflowTypes = async (req, res) => {
  try {
    const workflowTypes =
      await WorkflowType.find({
        active: true,
      })
        .sort({
          name: 1,
        });

    return res.status(200).json({
      success: true,
      count: workflowTypes.length,
      workflowTypes,
    });
  } catch (error) {
    console.error(
      "Get workflow types error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching workflow types",
    });
  }
};


const createWorkflowType = async (
  req,
  res
) => {
  try {
    const {
      name,
      description,
      requiredDocuments,
      defaultPriority,
      defaultDueDays,
    } = req.body;

    if (
      !name ||
      !description ||
      !defaultDueDays
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, and default due days are required",
      });
    }

    const existingType =
      await WorkflowType.findOne({
        name: name.trim(),
      });

    if (existingType) {
      return res.status(409).json({
        success: false,
        message:
          "A workflow type with this name already exists",
      });
    }

    const workflowType =
      await WorkflowType.create({
        name: name.trim(),
        description:
          description.trim(),
        requiredDocuments:
          requiredDocuments || [],
        defaultPriority:
          defaultPriority || "MEDIUM",
        defaultDueDays,
        active: true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Workflow type created successfully",
      workflowType,
    });
  } catch (error) {
    console.error(
      "Create workflow type error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating workflow type",
    });
  }
};


module.exports = {
  getWorkflowTypes,
  createWorkflowType,
};