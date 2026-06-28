// ============================================================
// Arab Unity School Operations Platform
// Permissions Module Entry Point
// ============================================================
//
// Purpose:
// Exports the Permissions module routes from one clean entry point.
//
// This keeps app-level route registration simple and consistent:
//
// const permissionRoutes = require("../modules/permissions");
//
// Architecture:
//
// app.js / routes index
//      ↓
// permissions/index.js
//      ↓
// routes/permissionRoutes.js
//
// ============================================================

const permissionRoutes = require("./routes/permissionRoutes");

// ============================================================
// Exports
// ============================================================

module.exports = permissionRoutes;