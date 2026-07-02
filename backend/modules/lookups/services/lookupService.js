// backend/modules/lookups/services/lookupService.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Lookup Service
 * ============================================================
 *
 * Purpose:
 * Contains lookup business logic.
 * ============================================================
 */

const lookupRepository = require("../repositories/lookupRepository");
const { BadRequestError } = require("../../../shared/errors");

async function getDepartments() {
  return lookupRepository.getDepartments();
}

async function getSections() {
  return lookupRepository.getSections();
}

async function getSubjects() {
  return lookupRepository.getSubjects();
}

async function getPurposes() {
  return lookupRepository.getPurposes();
}

async function getRoles() {
  return lookupRepository.getRoles();
}

async function getAccessLevels() {
  return lookupRepository.getAccessLevels();
}

async function getHods(departmentId) {
  const parsedDepartmentId = Number(departmentId);

  if (!parsedDepartmentId) {
    throw new BadRequestError("Department ID is required.");
  }

  return lookupRepository.getHodsByDepartment(parsedDepartmentId);
}

async function getWorkspaces() {
  return lookupRepository.getWorkspaces();
}

async function getModules() {
  return lookupRepository.getModules();
}

async function getMenus() {
  return lookupRepository.getMenus();
}

async function getPermissions() {
  return lookupRepository.getPermissions();
}

async function getFeatureFlags() {
  return lookupRepository.getFeatureFlags();
}

async function getVisibilityStatuses() {
  return lookupRepository.getVisibilityStatuses();
}

module.exports = {
  getDepartments,
  getSections,
  getSubjects,
  getPurposes,
  getRoles,
  getAccessLevels,
  getHods,
  getWorkspaces,
  getModules,
  getMenus,
  getPermissions,
  getFeatureFlags,
  getVisibilityStatuses,
};