const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  requestId,
  userId,
  action,
  previousStatus = null,
  newStatus = null,
  description,
  metadata = {},
}) => {
  const auditLog = await AuditLog.create({
    requestId,
    userId,
    action,
    previousStatus,
    newStatus,
    description,
    metadata,
  });

  return auditLog;
};

module.exports = {
  createAuditLog,
};