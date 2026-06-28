// ============================================================
// Arab Unity School Operations Platform
// Role Permissions Module Entry Point
// ============================================================
//
// Purpose:
// Exports the Role Permissions module routes from one clean entry point.
//
// This keeps app-level route registration simple and consistent:
//
// router.use("/role-permissions", require("../modules/rolePermissions"));
//
// ============================================================

const rolePermissionRoutes = require("./routes/rolePermissionRoutes");

// ============================================================
// Exports
// ============================================================

module.exports = rolePermissionRoutes;