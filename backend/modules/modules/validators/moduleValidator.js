// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Validator
// ============================================
//
// Purpose:
// Validates Module Manager request payloads
// before they reach the service layer.
// ============================================

const validateCreateModule = (req, res, next) => {
  const {
    moduleKey,
    moduleName,
    visibilityStatusKey,
    sortOrder,
  } = req.body;

  if (!moduleKey || !moduleName) {
    return res.status(400).json({
      success: false,
      message: "Module key and module name are required.",
    });
  }

  if (moduleKey.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Module key cannot exceed 100 characters.",
    });
  }

  if (moduleName.length > 150) {
    return res.status(400).json({
      success: false,
      message: "Module name cannot exceed 150 characters.",
    });
  }

  if (visibilityStatusKey && visibilityStatusKey.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Visibility status key cannot exceed 50 characters.",
    });
  }

  if (sortOrder !== undefined && Number.isNaN(Number(sortOrder))) {
    return res.status(400).json({
      success: false,
      message: "Sort order must be a number.",
    });
  }

  next();
};

const validateUpdateModule = (req, res, next) => {
  const { moduleName, visibilityStatusKey, sortOrder } = req.body;

  if (!moduleName) {
    return res.status(400).json({
      success: false,
      message: "Module name is required.",
    });
  }

  if (moduleName.length > 150) {
    return res.status(400).json({
      success: false,
      message: "Module name cannot exceed 150 characters.",
    });
  }

  if (visibilityStatusKey && visibilityStatusKey.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Visibility status key cannot exceed 50 characters.",
    });
  }

  if (sortOrder !== undefined && Number.isNaN(Number(sortOrder))) {
    return res.status(400).json({
      success: false,
      message: "Sort order must be a number.",
    });
  }

  next();
};

const validateModuleId = (req, res, next) => {
  const moduleId = Number(req.params.id);

  if (!moduleId || Number.isNaN(moduleId)) {
    return res.status(400).json({
      success: false,
      message: "Valid module ID is required.",
    });
  }

  req.params.id = moduleId;
  next();
};

module.exports = {
  validateCreateModule,
  validateUpdateModule,
  validateModuleId,
};