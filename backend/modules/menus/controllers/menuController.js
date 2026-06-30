// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Controller
// ============================================
//
// Purpose:
// Handles HTTP requests for the Super Admin
// Menu Manager.
//
// Architecture:
// Routes -> Controller -> Service
//
// Controllers remain thin and contain no
// business logic.
// ============================================

const menuService = require("../services/menuService");

// ============================================
// Get Menus
// ============================================

const getMenus = async (req, res, next) => {
  try {
    const result = await menuService.getMenus(req.query);

    return res.status(200).json({
      success: true,
      message: "Menus retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Menu By ID
// ============================================

const getMenuById = async (req, res, next) => {
  try {
    const menu = await menuService.getMenuById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Menu retrieved successfully.",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Create Menu
// ============================================

const createMenu = async (req, res, next) => {
  try {
    const menu = await menuService.createMenu(req.body);

    return res.status(201).json({
      success: true,
      message: "Menu created successfully.",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Update Menu
// ============================================

const updateMenu = async (req, res, next) => {
  try {
    const menu = await menuService.updateMenu(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Menu updated successfully.",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Show Menu
// ============================================

const showMenu = async (req, res, next) => {
  try {
    const menu = await menuService.showMenu(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Menu shown successfully.",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Hide Menu
// ============================================

const hideMenu = async (req, res, next) => {
  try {
    const menu = await menuService.hideMenu(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Menu hidden successfully.",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Delete Menu
// ============================================

const deleteMenu = async (req, res, next) => {
  try {
    const result = await menuService.deleteMenu(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Menu deleted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Exports
// ============================================

module.exports = {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  showMenu,
  hideMenu,
  deleteMenu,
};