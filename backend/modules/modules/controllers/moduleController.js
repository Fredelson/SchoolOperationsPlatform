// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Controller
// ============================================
//
// Purpose:
// Handles HTTP requests for the Module Manager.
//
// Architecture:
// Routes
//    ↓
// Controller
//    ↓
// Service
//
// Controllers remain thin and contain no
// business logic.
// ============================================

const moduleService = require("../services/moduleService");

// ============================================
// Get Modules
// ============================================
//
// Supports:
//
// Legacy
// GET /api/modules
//
// Paginated
// GET /api/modules?page=1&pageSize=10
// ============================================

const getModules = async (req, res, next) => {
  try {
    const result = await moduleService.getModules(req.query);

    return res.status(200).json({
      success: true,
      message: "Modules retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Module By Id
// ============================================

const getModuleById = async (req, res, next) => {
  try {
    const module = await moduleService.getModuleById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Module retrieved successfully.",
      data: module,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Create Module
// ============================================

const createModule = async (req, res, next) => {
  try {
    const module = await moduleService.createModule(req.body);

    return res.status(201).json({
      success: true,
      message: "Module created successfully.",
      data: module,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Update Module
// ============================================

const updateModule = async (req, res, next) => {
  try {
    const module = await moduleService.updateModule(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Module updated successfully.",
      data: module,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Activate Module
// ============================================

const activateModule = async (req, res, next) => {
  try {
    const module = await moduleService.activateModule(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Module activated successfully.",
      data: module,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Deactivate Module
// ============================================

const deactivateModule = async (req, res, next) => {
  try {
    const module = await moduleService.deactivateModule(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Module deactivated successfully.",
      data: module,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Delete Module
// ============================================

const deleteModule = async (req, res, next) => {
  try {
    const result = await moduleService.deleteModule(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully.",
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
  getModules,
  getModuleById,
  createModule,
  updateModule,
  activateModule,
  deactivateModule,
  deleteModule,
};