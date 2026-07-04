/* =========================================================
   Navigation Manager Controller
   Purpose:
   Handles HTTP request/response for Navigation Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const navigationManagerService = require("../services/navigationManagerService");

/* =========================================================
   GET NAVIGATION MENUS
   Route: GET /api/navigation-manager
========================================================= */

const getNavigationMenus = async (req, res) => {
  try {
    const result = await navigationManagerService.getNavigationMenus(req.query);

    return res.status(200).json({
      success: true,
      message: "Navigation menus loaded successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Get Navigation Menus Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load navigation menus.",
    });
  }
};

/* =========================================================
   GET NAVIGATION MENU BY ID
   Route: GET /api/navigation-manager/:id
========================================================= */

const getNavigationMenuById = async (req, res) => {
  try {
    const menu = await navigationManagerService.getNavigationMenuById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Navigation menu loaded successfully.",
      data: menu,
    });
  } catch (error) {
    console.error("Get Navigation Menu By ID Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load navigation menu.",
    });
  }
};

/* =========================================================
   CREATE NAVIGATION MENU
   Route: POST /api/navigation-manager
========================================================= */

const createNavigationMenu = async (req, res) => {
  try {
    const menu = await navigationManagerService.createNavigationMenu(req.body);

    return res.status(201).json({
      success: true,
      message: "Navigation menu created successfully.",
      data: menu,
    });
  } catch (error) {
    console.error("Create Navigation Menu Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create navigation menu.",
    });
  }
};

/* =========================================================
   UPDATE NAVIGATION MENU
   Route: PUT /api/navigation-manager/:id
========================================================= */

const updateNavigationMenu = async (req, res) => {
  try {
    const menu = await navigationManagerService.updateNavigationMenu(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Navigation menu updated successfully.",
      data: menu,
    });
  } catch (error) {
    console.error("Update Navigation Menu Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update navigation menu.",
    });
  }
};

/* =========================================================
   DELETE NAVIGATION MENU
   Route: DELETE /api/navigation-manager/:id
========================================================= */

const deleteNavigationMenu = async (req, res) => {
  try {
    const menu = await navigationManagerService.deleteNavigationMenu(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Navigation menu deleted successfully.",
      data: menu,
    });
  } catch (error) {
    console.error("Delete Navigation Menu Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete navigation menu.",
    });
  }
};

/* =========================================================
   GET NAVIGATION LOOKUPS
   Route: GET /api/navigation-manager/lookups
========================================================= */

const getNavigationLookups = async (req, res) => {
  try {
    const lookups = await navigationManagerService.getNavigationLookups();

    return res.status(200).json({
      success: true,
      message: "Navigation lookups loaded successfully.",
      data: lookups,
    });
  } catch (error) {
    console.error("Get Navigation Lookups Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load navigation lookups.",
    });
  }
};

/* =========================================================
   EXPORT CONTROLLER
========================================================= */

module.exports = {
  getNavigationMenus,
  getNavigationMenuById,
  createNavigationMenu,
  updateNavigationMenu,
  deleteNavigationMenu,
  getNavigationLookups,
};