// ============================================================
// Arab Unity School Operations Platform
// Roles Module
// ============================================================
//
// Purpose:
// Entry point for the Roles module.
//
// This file exposes the module's routes to the
// central API router.
//
// Architecture:
//
// routes/index.js
//          ↓
// modules/roles/index.js
//          ↓
// routes/roleRoutes.js
//
// ============================================================

const roleRoutes = require("./routes/roleRoutes");

module.exports = roleRoutes;