const dashboardManagerService = require("../services/dashboardManagerService");

const getDashboards = async (req, res) => {
  try {
    const result = await dashboardManagerService.getDashboards(req.query);

    return res.status(200).json({
      success: true,
      message: "Dashboards loaded successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Get Dashboards Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load dashboards.",
    });
  }
};

const getDashboardById = async (req, res) => {
  try {
    const dashboard = await dashboardManagerService.getDashboardById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Dashboard loaded successfully.",
      data: dashboard,
    });
  } catch (error) {
    console.error("Get Dashboard By ID Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load dashboard.",
    });
  }
};

const createDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardManagerService.createDashboard(req.body);

    return res.status(201).json({
      success: true,
      message: "Dashboard created successfully.",
      data: dashboard,
    });
  } catch (error) {
    console.error("Create Dashboard Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create dashboard.",
    });
  }
};

const updateDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardManagerService.updateDashboard(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard updated successfully.",
      data: dashboard,
    });
  } catch (error) {
    console.error("Update Dashboard Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update dashboard.",
    });
  }
};

const deleteDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardManagerService.deleteDashboard(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Dashboard deleted successfully.",
      data: dashboard,
    });
  } catch (error) {
    console.error("Delete Dashboard Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete dashboard.",
    });
  }
};

const getDashboardLookups = async (req, res) => {
  try {
    const lookups = await dashboardManagerService.getDashboardLookups();

    return res.status(200).json({
      success: true,
      message: "Dashboard lookups loaded successfully.",
      data: lookups,
    });
  } catch (error) {
    console.error("Get Dashboard Lookups Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load dashboard lookups.",
    });
  }
};

module.exports = {
  getDashboards,
  getDashboardById,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  getDashboardLookups,
};