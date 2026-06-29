// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Controller
// ============================================
//
// Purpose:
// Handles HTTP requests for the Module Manager.
// Controllers stay thin and delegate business
// logic to the service layer.
// ============================================

const moduleService = require("../services/moduleService");

const getModules = async (req, res, next) => {
  try {
    const modules = await moduleService.getModules(req.query);

    return res.status(200).json({
      success: true,
      message: "Modules retrieved successfully.",
      data: modules,
    });
  } catch (error) {
    next(error);
  }
};

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

const updateModule = async (req, res, next) => {
  try {
    const module = await moduleService.updateModule(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Module updated successfully.",
      data: module,
    });
  } catch (error) {
    next(error);
  }
};

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

module.exports = {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  activateModule,
  deactivateModule,
  deleteModule,
};