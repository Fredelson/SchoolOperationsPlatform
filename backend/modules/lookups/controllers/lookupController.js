// backend/modules/lookups/controllers/lookupController.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Lookup Controller
 * ============================================================
 *
 * Purpose:
 * Handles HTTP requests for frontend dropdown data.
 * ============================================================
 */

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");
const lookupService = require("../services/lookupService");

const getDepartments = asyncHandler(async (req, res) => {
  const data = await lookupService.getDepartments();
  return sendSuccess(res, "Departments loaded successfully.", data);
});

const getSections = asyncHandler(async (req, res) => {
  const data = await lookupService.getSections();
  return sendSuccess(res, "Sections loaded successfully.", data);
});

const getSubjects = asyncHandler(async (req, res) => {
  const data = await lookupService.getSubjects();
  return sendSuccess(res, "Subjects loaded successfully.", data);
});

const getPurposes = asyncHandler(async (req, res) => {
  const data = await lookupService.getPurposes();
  return sendSuccess(res, "Purposes loaded successfully.", data);
});

const getRoles = asyncHandler(async (req, res) => {
  const data = await lookupService.getRoles();
  return sendSuccess(res, "Roles loaded successfully.", data);
});

const getAccessLevels = asyncHandler(async (req, res) => {
  const data = await lookupService.getAccessLevels();
  return sendSuccess(res, "Access levels loaded successfully.", data);
});

const getHods = asyncHandler(async (req, res) => {
  const data = await lookupService.getHods(req.query.departmentId);
  return sendSuccess(res, "HODs loaded successfully.", data);
});

module.exports = {
  getDepartments,
  getSections,
  getSubjects,
  getPurposes,
  getRoles,
  getAccessLevels,
  getHods,
};