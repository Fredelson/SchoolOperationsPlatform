/* =========================================================
   IT Asset Borrow Controller
========================================================= */

const service = require("../services/assetBorrowService");

const borrowAsset = async (req, res) => {
  try {
    const result = await service.borrowAsset({
      payload: req.body,
      user: req.user,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: "Asset borrowed successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const returnBorrowedAsset = async (req, res) => {
  try {
    const result = await service.returnBorrowedAsset({
      payload: req.body,
      user: req.user,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Borrowed asset returned successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBorrowHistory = async (req, res) => {
  try {
    const data = await service.getBorrowHistory({
      assetId: req.params.assetId || req.query.assetId || null,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveBorrows = async (req, res) => {
  try {
    const data = await service.getActiveBorrows();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOverdueBorrows = async (req, res) => {
  try {
    const data = await service.getOverdueBorrows();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  borrowAsset,
  returnBorrowedAsset,
  getBorrowHistory,
  getActiveBorrows,
  getOverdueBorrows,
};