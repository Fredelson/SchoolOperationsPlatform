/* =========================================================
   Navigation Manager Validator
   Purpose:
   Validates request payloads before reaching service layer.
========================================================= */

const validateNavigationMenuPayload = (req, res, next) => {
  const {
    moduleId,
    menuKey,
    menuName,
    visibilityStatusId,
    sortOrder,
  } = req.body;

  if (!moduleId || !menuKey || !menuName || !visibilityStatusId) {
    return res.status(400).json({
      success: false,
      message: "Module, menu key, menu name, and visibility status are required.",
    });
  }

  if (String(menuKey).trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Menu key must be at least 2 characters.",
    });
  }

  if (String(menuName).trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Menu name must be at least 2 characters.",
    });
  }

  if (sortOrder !== undefined && Number.isNaN(Number(sortOrder))) {
    return res.status(400).json({
      success: false,
      message: "Sort order must be a valid number.",
    });
  }

  next();
};

module.exports = {
  validateNavigationMenuPayload,
};