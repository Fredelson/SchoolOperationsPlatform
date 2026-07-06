const validateReportIssue = (req, res, next) => {
  if (!req.body.assetId) {
    return res.status(400).json({ success: false, message: "Asset ID is required." });
  }

  if (!req.body.issueTypeId) {
    return res.status(400).json({ success: false, message: "Issue type is required." });
  }

  return next();
};

const validateAssignIssue = (req, res, next) => {
  if (!req.body.issueLogId || !req.body.assignedToUserId) {
    return res.status(400).json({
      success: false,
      message: "Issue log ID and assigned user ID are required.",
    });
  }

  return next();
};

const validateResolveIssue = (req, res, next) => {
  if (!req.body.issueLogId) {
    return res.status(400).json({ success: false, message: "Issue log ID is required." });
  }

  return next();
};

module.exports = {
  validateReportIssue,
  validateAssignIssue,
  validateResolveIssue,
};