/* =========================================================
   Workspace Manager Controller
   Purpose:
   Handles HTTP request/response for Workspace Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const workspaceManagerService = require("../services/workspaceManagerService");

/* =========================================================
   GET WORKSPACES
========================================================= */

const getWorkspaces = async (req, res) => {
  try {
    const result = await workspaceManagerService.getWorkspaces(req.query);

    return res.status(200).json({
      success: true,
      message: "Workspaces loaded successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Get Workspaces Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load workspaces.",
    });
  }
};

/* =========================================================
   GET WORKSPACE BY ID
========================================================= */

const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await workspaceManagerService.getWorkspaceById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Workspace loaded successfully.",
      data: workspace,
    });
  } catch (error) {
    console.error("Get Workspace By ID Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load workspace.",
    });
  }
};

/* =========================================================
   CREATE WORKSPACE
========================================================= */

const createWorkspace = async (req, res) => {
  try {
    const workspace = await workspaceManagerService.createWorkspace(req.body);

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully.",
      data: workspace,
    });
  } catch (error) {
    console.error("Create Workspace Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create workspace.",
    });
  }
};

/* =========================================================
   UPDATE WORKSPACE
========================================================= */

const updateWorkspace = async (req, res) => {
  try {
    const workspace = await workspaceManagerService.updateWorkspace(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Workspace updated successfully.",
      data: workspace,
    });
  } catch (error) {
    console.error("Update Workspace Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update workspace.",
    });
  }
};

/* =========================================================
   DELETE WORKSPACE
========================================================= */

const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await workspaceManagerService.deleteWorkspace(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully.",
      data: workspace,
    });
  } catch (error) {
    console.error("Delete Workspace Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete workspace.",
    });
  }
};

/* =========================================================
   GET LOOKUPS
========================================================= */

const getWorkspaceLookups = async (req, res) => {
  try {
    const lookups = await workspaceManagerService.getWorkspaceLookups();

    return res.status(200).json({
      success: true,
      message: "Workspace lookups loaded successfully.",
      data: lookups,
    });
  } catch (error) {
    console.error("Get Workspace Lookups Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load workspace lookups.",
    });
  }
};

/* =========================================================
   EXPORT CONTROLLER
========================================================= */

module.exports = {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceLookups,
};