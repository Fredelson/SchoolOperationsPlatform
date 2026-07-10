const service = require("../services/assetTransferService");

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
  transferAsset: handle((req) =>
    service.transferAsset({ payload: req.body, user: req.user, ipAddress: req.ip })
  ),

  createTransferRequest: handle((req) =>
    service.createTransferRequest({ payload: req.body, user: req.user })
  ),

  approveTransfer: handle((req) =>
    service.approveTransfer({ payload: req.body, user: req.user })
  ),

  rejectTransfer: handle((req) =>
    service.rejectTransfer({ payload: req.body })
  ),

  completeTransfer: handle((req) =>
    service.completeTransfer({ payload: req.body, user: req.user, ipAddress: req.ip })
  ),

  getTransfers: handle(() => service.getTransfers()),

  getTransfersByAssetId: handle((req) =>
    service.getTransfersByAssetId(req.params.assetId)
  ),
};
