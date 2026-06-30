// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Validator
// ============================================
//
// Purpose:
// Validates Menu Manager request payloads
// before they reach the service layer.
// ============================================

const validateCreateMenu = (req, res, next) => {
  const {
    moduleId,
    menuKey,
    menuName,
    visibilityStatusKey,
    sortOrder,
  } = req.body;

  if (!moduleId || !menuKey || !menuName) {
    return res.status(400).json({
      success: false,
      message: "Module, menu key, and menu name are required.",
    });
  }

  if (Number.isNaN(Number(moduleId))) {
    return res.status(400).json({
      success: false,
      message: "Module ID must be a number.",
    });
  }

  if (menuKey.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Menu key cannot exceed 100 characters.",
    });
  }

  if (menuName.length > 150) {
    return res.status(400).json({
      success: false,
      message: "Menu name cannot exceed 150 characters.",
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

const validateUpdateMenu = (req, res, next) => {
  const {
    moduleId,
    menuName,
    visibilityStatusKey,
    sortOrder,
  } = req.body;

  if (!menuName) {
    return res.status(400).json({
      success: false,
      message: "Menu name is required.",
    });
  }

  if (moduleId !== undefined && Number.isNaN(Number(moduleId))) {
    return res.status(400).json({
      success: false,
      message: "Module ID must be a number.",
    });
  }

  if (menuName.length > 150) {
    return res.status(400).json({
      success: false,
      message: "Menu name cannot exceed 150 characters.",
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

const validateMenuId = (req, res, next) => {
  const menuId = Number(req.params.id);

  if (!menuId || Number.isNaN(menuId)) {
    return res.status(400).json({
      success: false,
      message: "Valid menu ID is required.",
    });
  }

  req.params.id = menuId;
  next();
};

module.exports = {
  validateCreateMenu,
  validateUpdateMenu,
  validateMenuId,
};