const calculateDaysRemaining = (
  dueDate
) => {
  if (!dueDate) {
    return null;
  }

  const now = new Date();
  const deadline =
    new Date(dueDate);

  const difference =
    deadline.getTime() -
    now.getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
};


const calculateDaysInCurrentStage = (
  request
) => {
  if (
    request.status === "DRAFT"
  ) {
    return 0;
  }

  const stageStart =
    request.stageChangedAt ||
    request.updatedAt;

  if (!stageStart) {
    return 0;
  }

  const now = new Date();

  const stageChangedAt =
    new Date(stageStart);

  const difference =
    now.getTime() -
    stageChangedAt.getTime();

  return Math.max(
    0,
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
};


const getDeadlineStatus = (
  request
) => {
  if (
    request.status ===
      "APPROVED" ||
    request.status ===
      "REJECTED"
  ) {
    return "COMPLETED";
  }

  if (!request.dueDate) {
    return "NO_DEADLINE";
  }

  const daysRemaining =
    calculateDaysRemaining(
      request.dueDate
    );

  if (daysRemaining < 0) {
    return "OVERDUE";
  }

  if (daysRemaining <= 2) {
    return "DUE_SOON";
  }

  return "ON_TRACK";
};


const getTypeRiskScore = (
  type
) => {
  if (!type) {
    return 0;
  }

  const normalizedType =
    type
      .toString()
      .trim()
      .toUpperCase();

  const typeScores = {
    SECURITY: 20,
    FINANCE: 20,
    COMPLIANCE: 20,
    LEGAL: 20,
    PROCUREMENT: 15,
    ACCESS: 15,
    HR: 10,
    TECHNICAL: 10,
    IT: 10,
    GENERAL: 5,
  };

  return (
    typeScores[
      normalizedType
    ] || 5
  );
};


const getTypeRiskReason = (
  type
) => {
  if (!type) {
    return null;
  }

  const normalizedType =
    type
      .toString()
      .trim()
      .toUpperCase();

  const highRiskTypes = [
    "SECURITY",
    "FINANCE",
    "COMPLIANCE",
    "LEGAL",
  ];

  const mediumRiskTypes = [
    "PROCUREMENT",
    "ACCESS",
    "HR",
    "TECHNICAL",
    "IT",
  ];

  if (
    highRiskTypes.includes(
      normalizedType
    )
  ) {
    return `${type} workflow type carries elevated review sensitivity`;
  }

  if (
    mediumRiskTypes.includes(
      normalizedType
    )
  ) {
    return `${type} workflow type requires additional review consideration`;
  }

  return null;
};


const getPriorityRiskScore = (
  priority
) => {
  const priorityScores = {
    LOW: 0,
    MEDIUM: 10,
    HIGH: 20,
    CRITICAL: 30,
  };

  return (
    priorityScores[
      priority
    ] || 0
  );
};


const getPriorityReason = (
  request
) => {
  const priority =
    request.priority ||
    "MEDIUM";

  const defaultPriority =
    request.workflowDefaultPriority ||
    null;

  if (
    priority === "CRITICAL"
  ) {
    return "Critical priority request";
  }

  if (
    priority === "HIGH"
  ) {
    return "High priority request";
  }

  if (
    defaultPriority &&
    priority !== defaultPriority
  ) {
    return `Priority was adjusted from workflow default ${defaultPriority} to ${priority}`;
  }

  return null;
};


const calculateRiskScore = (
  request
) => {
  let score = 0;

  const reasons = [];

  const priority =
    request.priority ||
    "MEDIUM";

  const status =
    request.status ||
    "DRAFT";

  const deadlineStatus =
    getDeadlineStatus(
      request
    );

  const daysRemaining =
    calculateDaysRemaining(
      request.dueDate
    );

  const daysInStage =
    calculateDaysInCurrentStage(
      request
    );


  /* REQUEST TYPE */

  const typeRiskScore =
    getTypeRiskScore(
      request.type
    );

  score += typeRiskScore;

  const typeReason =
    getTypeRiskReason(
      request.type
    );

  if (typeReason) {
    reasons.push(
      typeReason
    );
  }


  /* PRIORITY */

  const priorityScore =
    getPriorityRiskScore(
      priority
    );

  score += priorityScore;

  const priorityReason =
    getPriorityReason(
      request
    );

  if (priorityReason) {
    reasons.push(
      priorityReason
    );
  }


  /* DEADLINE */

  if (
    deadlineStatus ===
    "OVERDUE"
  ) {
    score += 40;

    reasons.push(
      "Request has passed its due date"
    );
  }


  if (
    deadlineStatus ===
    "DUE_SOON"
  ) {
    score += 25;

    if (
      daysRemaining !== null
    ) {
      if (
        daysRemaining === 0
      ) {
        reasons.push(
          "Request is due today"
        );
      } else if (
        daysRemaining === 1
      ) {
        reasons.push(
          "Request is due within 1 day"
        );
      } else {
        reasons.push(
          "Request is due within 2 days"
        );
      }
    }
  }


  /* WORKFLOW STATUS */

  const statusScores = {
    DRAFT: 0,
    SUBMITTED: 10,
    UNDER_REVIEW: 15,
    CHANGES_REQUESTED: 20,
    RESUBMITTED: 20,
    APPROVED: 0,
    REJECTED: 0,
  };

  score +=
    statusScores[
      status
    ] || 0;


  if (
    status ===
    "CHANGES_REQUESTED"
  ) {
    reasons.push(
      "Changes have been requested"
    );
  }


  if (
    status ===
    "RESUBMITTED"
  ) {
    reasons.push(
      "Request has been resubmitted for review"
    );
  }


  /* TIME IN CURRENT STAGE */

  if (
    daysInStage >= 7
  ) {
    score += 30;

    reasons.push(
      `Request has remained in its current stage for ${daysInStage} days`
    );

  } else if (
    daysInStage >= 4
  ) {
    score += 20;

    reasons.push(
      `Request has remained in its current stage for ${daysInStage} days`
    );

  } else if (
    daysInStage >= 2
  ) {
    score += 10;
  }


  /* COMBINED PRESSURE */

  if (
    deadlineStatus ===
      "OVERDUE" &&
    [
      "HIGH",
      "CRITICAL",
    ].includes(priority)
  ) {
    score += 15;

    reasons.push(
      "High-priority request is overdue"
    );
  }


  if (
    deadlineStatus ===
      "DUE_SOON" &&
    [
      "HIGH",
      "CRITICAL",
    ].includes(priority)
  ) {
    score += 10;

    reasons.push(
      "High-priority request has an approaching deadline"
    );
  }


  score = Math.min(
    Math.max(
      score,
      0
    ),
    100
  );


  return {
    score,
    reasons,
    daysRemaining,
    daysInStage,
    typeRiskScore,
    priorityScore,
  };
};


const getRiskLevel = (
  score
) => {
  if (score >= 75) {
    return "CRITICAL";
  }

  if (score >= 50) {
    return "HIGH";
  }

  if (score >= 25) {
    return "MEDIUM";
  }

  return "LOW";
};


const getRecommendation = ({
  riskLevel,
  deadlineStatus,
  status,
}) => {
  if (
    riskLevel ===
    "CRITICAL"
  ) {
    return "Immediate review recommended";
  }

  if (
    deadlineStatus ===
    "OVERDUE"
  ) {
    return "Review deadline pressure immediately";
  }

  if (
    riskLevel ===
    "HIGH"
  ) {
    return "Prioritize this request for review";
  }

  if (
    deadlineStatus ===
    "DUE_SOON"
  ) {
    return "Monitor closely due to approaching deadline";
  }

  if (
    status === "SUBMITTED" ||
    status === "RESUBMITTED"
  ) {
    return "Ready for reviewer attention";
  }

  return "Continue normal workflow monitoring";
};


const calculateIntelligence = (
  request
) => {
  const deadlineStatus =
    getDeadlineStatus(
      request
    );

  const riskData =
    calculateRiskScore(
      request
    );

  const riskLevel =
    getRiskLevel(
      riskData.score
    );


  return {
    riskLevel,

    riskScore:
      riskData.score,

    deadlineStatus,

    daysRemaining:
      riskData.daysRemaining,

    daysInCurrentStage:
      riskData.daysInStage,

    reasons:
      riskData.reasons,

    priority:
      request.priority,

    workflowDefaultPriority:
      request.workflowDefaultPriority ||
      null,

    priorityScore:
      riskData.priorityScore,

    type:
      request.type,

    typeRiskScore:
      riskData.typeRiskScore,

    status:
      request.status,

    recommendation:
      getRecommendation({
        riskLevel,
        deadlineStatus,
        status:
          request.status,
      }),
  };
};


module.exports = {
  calculateIntelligence,
  calculateDaysRemaining,
  calculateDaysInCurrentStage,
  getDeadlineStatus,
  calculateRiskScore,
  getRiskLevel,
  getTypeRiskScore,
  getTypeRiskReason,
};