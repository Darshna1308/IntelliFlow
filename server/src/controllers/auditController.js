const AuditLog = require("../models/AuditLog");

const getRequestAuditLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const auditLogs = await AuditLog.find({
      requestId: id,
    })
      .populate("userId", "name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: auditLogs.length,
      auditLogs,
    });
  } catch (error) {
    console.error("Get audit logs error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching audit logs",
    });
  }
};

module.exports = {
  getRequestAuditLogs,
};