const VALID_TRANSITIONS = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "CHANGES_REQUESTED"],
  CHANGES_REQUESTED: ["RESUBMITTED"],
  RESUBMITTED: ["UNDER_REVIEW"],
  APPROVED: [],
  REJECTED: [],
};

const isValidTransition = (currentStatus, newStatus) => {
  const allowedStatuses = VALID_TRANSITIONS[currentStatus] || [];

  return allowedStatuses.includes(newStatus);
};

const getAllowedTransitions = (currentStatus) => {
  return VALID_TRANSITIONS[currentStatus] || [];
};

module.exports = {
  VALID_TRANSITIONS,
  isValidTransition,
  getAllowedTransitions,
};