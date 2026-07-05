const validateDashboardPayload = (req, res, next) => {
  const { dashboardKey, dashboardName, visibilityStatusId } = req.body;

  if (!dashboardKey || !dashboardName || !visibilityStatusId) {
    return res.status(400).json({
      success: false,
      message: "Dashboard key, dashboard name, and visibility status are required.",
    });
  }

  next();
};

module.exports = {
  validateDashboardPayload,
};