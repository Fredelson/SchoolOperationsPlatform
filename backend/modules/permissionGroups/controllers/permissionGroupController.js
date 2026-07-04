const permissionGroupService = require("../services/permissionGroupService");

const getPermissionGroups = async (req, res) => {
  try {
    const result = await permissionGroupService.getPermissionGroups(req.query);

    return res.status(200).json({
      success: true,
      message: "Permission groups loaded successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Get Permission Groups Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load permission groups.",
    });
  }
};

const getPermissionGroupById = async (req, res) => {
  try {
    const group = await permissionGroupService.getPermissionGroupById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Permission group loaded successfully.",
      data: group,
    });
  } catch (error) {
    console.error("Get Permission Group By ID Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load permission group.",
    });
  }
};

const createPermissionGroup = async (req, res) => {
  try {
    const group = await permissionGroupService.createPermissionGroup(req.body);

    return res.status(201).json({
      success: true,
      message: "Permission group created successfully.",
      data: group,
    });
  } catch (error) {
    console.error("Create Permission Group Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create permission group.",
    });
  }
};

const updatePermissionGroup = async (req, res) => {
  try {
    const group = await permissionGroupService.updatePermissionGroup(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Permission group updated successfully.",
      data: group,
    });
  } catch (error) {
    console.error("Update Permission Group Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update permission group.",
    });
  }
};

const deletePermissionGroup = async (req, res) => {
  try {
    const result = await permissionGroupService.deletePermissionGroup(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Permission group deleted successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Delete Permission Group Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete permission group.",
    });
  }
};

module.exports = {
  getPermissionGroups,
  getPermissionGroupById,
  createPermissionGroup,
  updatePermissionGroup,
  deletePermissionGroup,
};