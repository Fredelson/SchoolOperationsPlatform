/* =========================================================
   Workspace Manager Validator
========================================================= */

const validateWorkspacePayload = (req, res, next) => {
  const { workspaceKey, workspaceName, visibilityStatusId } = req.body;

  if (!workspaceKey || !workspaceName || !visibilityStatusId) {
    return res.status(400).json({
      success: false,
      message: "Workspace key, workspace name, and visibility status are required.",
    });
  }

  if (String(workspaceKey).trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Workspace key must be at least 2 characters.",
    });
  }

  if (String(workspaceName).trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Workspace name must be at least 2 characters.",
    });
  }

  next();
};

module.exports = {
  validateWorkspacePayload,
};