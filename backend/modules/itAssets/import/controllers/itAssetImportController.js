/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Import Controller
========================================================= */

const service = require("../services/itAssetImportService");

const uploadPreview = async (req, res, next) => {
  try {
    const userId = req.user?.UserId || req.user?.userId || req.user?.id || null;

    const result = await service.uploadAndPreview({
      file: req.file,
      userId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const commitImport = async (req, res, next) => {
  try {
    const userId = req.user?.UserId || req.user?.userId || req.user?.id || null;
    const importBatchId = Number(req.params.batchId || req.body.importBatchId);

    const result = await service.commitImport({
      importBatchId,
      userId,
    });

    return res.json({
      success: true,
      message: "IT asset import committed successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getImportHistory = async (req, res, next) => {
  try {
    const result = await service.getImportHistory({
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    });

    return res.json({
      success: true,
      data: result.rows,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPreview,
  commitImport,
  getImportHistory,
};