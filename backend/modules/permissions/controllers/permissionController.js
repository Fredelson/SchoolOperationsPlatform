/* =========================================================
   Permission Controller
   Purpose:
   Handles HTTP request/response for Permission Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const permissionService = require("../services/permissionService");

/* =========================================================
   GET PERMISSIONS
   Route: GET /api/permissions
========================================================= */
const getPermissions = async (req, res) => {
  try {
    const result = await permissionService.getPermissions(req.query);

    return res.status(200).json({
      success: true,
      message: "Permissions loaded successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Get Permissions Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load permissions.",
    });
  }
};

/* =========================================================
   GET PERMISSION BY ID
   Route: GET /api/permissions/:id
========================================================= */
const getPermissionById = async (req, res) => {
  try {
    const permission = await permissionService.getPermissionById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Permission loaded successfully.",
      data: permission,
    });
  } catch (error) {
    console.error("Get Permission By ID Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load permission.",
    });
  }
};

/* =========================================================
   CREATE PERMISSION
   Route: POST /api/permissions
========================================================= */
const createPermission = async (req, res) => {
  try {
    const permission = await permissionService.createPermission(req.body);

    return res.status(201).json({
      success: true,
      message: "Permission created successfully.",
      data: permission,
    });
  } catch (error) {
    console.error("Create Permission Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create permission.",
    });
  }
};

/* =========================================================
   UPDATE PERMISSION
   Route: PUT /api/permissions/:id
========================================================= */
const updatePermission = async (req, res) => {
  try {
    const permission = await permissionService.updatePermission(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Permission updated successfully.",
      data: permission,
    });
  } catch (error) {
    console.error("Update Permission Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update permission.",
    });
  }
};

/* =========================================================
   DELETE PERMISSION
   Route: DELETE /api/permissions/:id
========================================================= */
const deletePermission = async (req, res) => {
  try {
    const permission = await permissionService.deletePermission(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Permission deleted successfully.",
      data: permission,
    });
  } catch (error) {
    console.error("Delete Permission Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete permission.",
    });
  }
};

/* =========================================================
   GET PERMISSION LOOKUPS
   Route: GET /api/permissions/lookups
========================================================= */
const getPermissionLookups = async (req, res) => {
  try {
    const lookups = await permissionService.getPermissionLookups();

    return res.status(200).json({
      success: true,
      message: "Permission lookups loaded successfully.",
      data: lookups,
    });
  } catch (error) {
    console.error("Get Permission Lookups Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load permission lookups.",
    });
  }
};

/* =========================================================
   EXPORT CONTROLLER FUNCTIONS
========================================================= */

module.exports = {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionLookups,
};