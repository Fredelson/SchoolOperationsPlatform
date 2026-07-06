const service = require("../services/assetIssueService");

const handle = (fn) => async (req, res) => {
  try {
    const data = await fn(req);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  reportIssue: handle((req) =>
    service.reportIssue({ payload: req.body, user: req.user, ipAddress: req.ip })
  ),

  assignIssue: handle((req) =>
    service.assignIssue({ payload: req.body })
  ),

  resolveIssue: handle((req) =>
    service.resolveIssue({ payload: req.body, user: req.user, ipAddress: req.ip })
  ),

  getIssues: handle((req) =>
    service.getIssues({
      status: req.query.status || null,
      assetId: req.query.assetId || null,
    })
  ),

  getOpenIssues: handle(() =>
    service.getIssues({ status: "OPEN" })
  ),

  getResolvedIssues: handle(() =>
    service.getIssues({ status: "RESOLVED" })
  ),

  getIssuesByAsset: handle((req) =>
    service.getIssues({ assetId: req.params.assetId })
  ),
};