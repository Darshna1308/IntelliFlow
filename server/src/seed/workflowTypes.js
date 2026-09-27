const mongoose = require("mongoose");
const dotenv = require("dotenv");

const WorkflowType = require("../models/WorkflowType");

dotenv.config();

const workflowTypes = [
  {
    name: "Technical",
    description:
      "Requests related to software, infrastructure, technical systems, or IT operations.",
    requiredDocuments: [],
    defaultPriority: "MEDIUM",
    defaultDueDays: 7,
    active: true,
  },

  {
    name: "Security",
    description:
      "Requests involving security access, security reviews, vulnerabilities, or sensitive systems.",
    requiredDocuments: [
      "Security Details",
    ],
    defaultPriority: "HIGH",
    defaultDueDays: 5,
    active: true,
  },

  {
    name: "Finance",
    description:
      "Requests involving payments, budgets, reimbursements, financial approvals, or expenses.",
    requiredDocuments: [
      "Financial Document",
    ],
    defaultPriority: "HIGH",
    defaultDueDays: 7,
    active: true,
  },

  {
    name: "HR",
    description:
      "Requests related to employee information, onboarding, HR processes, or internal people operations.",
    requiredDocuments: [],
    defaultPriority: "MEDIUM",
    defaultDueDays: 5,
    active: true,
  },

  {
    name: "Procurement",
    description:
      "Requests involving purchasing, vendors, equipment, or procurement approvals.",
    requiredDocuments: [
      "Quotation",
    ],
    defaultPriority: "MEDIUM",
    defaultDueDays: 10,
    active: true,
  },

  {
    name: "Compliance",
    description:
      "Requests involving compliance checks, regulatory requirements, policies, or documentation.",
    requiredDocuments: [
      "Compliance Document",
    ],
    defaultPriority: "HIGH",
    defaultDueDays: 7,
    active: true,
  },

  {
    name: "Access",
    description:
      "Requests for system, application, resource, or workspace access.",
    requiredDocuments: [],
    defaultPriority: "MEDIUM",
    defaultDueDays: 3,
    active: true,
  },

  {
    name: "General",
    description:
      "General workflow requests that do not belong to another defined category.",
    requiredDocuments: [],
    defaultPriority: "LOW",
    defaultDueDays: 7,
    active: true,
  },
];


const seedWorkflowTypes = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected for workflow type seeding"
    );

    for (const workflowType of workflowTypes) {
      await WorkflowType.findOneAndUpdate(
        {
          name: workflowType.name,
        },
        workflowType,
        {
          upsert: true,
          new: true,
        }
      );

      console.log(
        `Workflow type ready: ${workflowType.name}`
      );
    }

    console.log(
      "Workflow types seeded successfully"
    );

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "Workflow type seeding failed:",
      error.message
    );

    await mongoose.disconnect();

    process.exit(1);
  }
};


seedWorkflowTypes();