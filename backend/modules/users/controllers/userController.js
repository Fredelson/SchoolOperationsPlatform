// backend/modules/users/controllers/userController.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Users Controller
 * ============================================================
 *
 * Purpose:
 * Handles HTTP requests for user management.
 * ============================================================
 */

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");
const userService = require("../services/userService");

const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers();
  return sendSuccess(res, "Users loaded successfully.", result);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, "User loaded successfully.", user);
});

const createUser = asyncHandler(async (req, res) => {
  const result = await userService.createUser(req.body, req.user);
  return sendSuccess(res, "User created successfully.", result, 201);
});

const updateUser = asyncHandler(async (req, res) => {
  await userService.updateUser(req.params.id, req.body, req.user);
  return sendSuccess(res, "User updated successfully.");
});

const deactivateUser = asyncHandler(async (req, res) => {
  await userService.deactivateUser(req.params.id, req.user);
  return sendSuccess(res, "User deactivated successfully.");
});

const activateUser = asyncHandler(async (req, res) => {
  await userService.activateUser(req.params.id);
  return sendSuccess(res, "User activated successfully.");
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
};