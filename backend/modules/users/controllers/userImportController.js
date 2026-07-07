// backend/modules/users/controllers/userImportController.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * User Import Controller
 * ============================================================
 *
 * Purpose:
 * Handles HTTP requests for staff/user import.
 *
 * Routes:
 * - POST /api/users/import/preview
 * - POST /api/users/import/commit
 * - GET  /api/users/import/history
 *
 * Rules:
 * - No SQL here.
 * - No Excel parsing here.
 * - No business logic here.
 * ============================================================
 */

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");

const userImportService = require("../services/userImportService");

/**
 * Preview staff/user import file.
 */
const previewUserImport = asyncHandler(async (req, res) => {
  const result = await userImportService.previewUserImport(req.file, req.user);

  return sendSuccess(
    res,
    "User import preview generated successfully.",
    result
  );
});

/**
 * Commit validated staff/user import batch.
 */
const commitUserImport = asyncHandler(async (req, res) => {
  const result = await userImportService.commitUserImport(
    req.body.batchId,
    req.user
  );

  return sendSuccess(
    res,
    "User import committed successfully.",
    result
  );
});

/**
 * Get recent staff/user import history.
 */
const getUserImportHistory = asyncHandler(async (req, res) => {
  const result = await userImportService.getImportHistory();

  return sendSuccess(
    res,
    "User import history loaded successfully.",
    result
  );
});

module.exports = {
  previewUserImport,
  commitUserImport,
  getUserImportHistory,
};