/* =========================================================
   IT Asset Disposal Controller
========================================================= */

const service = require("../services/assetDisposalService");

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
  requestDisposal: handle((req) =>
    service.requestDisposal({ payload: req.body, user: req.user })
  ),

  approveDisposal: handle((req) =>
    service.approveDisposal({ payload: req.body, user: req.user })
  ),

  rejectDisposal: handle((req) =>
    service.rejectDisposal({ payload: req.body, user: req.user })
  ),

  completeDisposal: handle((req) =>
    service.completeDisposal({
      payload: req.body,
      user: req.user,
      ipAddress: req.ip,
    })
  ),

  getDisposals: handle((req) =>
    service.getDisposals({
      status: req.query.status || null,
      assetId: req.query.assetId || null,
    })
  ),

  getPendingDisposals: handle(() =>
    service.getDisposals({ status: "PENDING" })
  ),

  getCompletedDisposals: handle(() =>
    service.getDisposals({ status: "DISPOSED" })
  ),

  getDisposalsByAsset: handle((req) =>
    service.getDisposals({ assetId: req.params.assetId })
  ),
};