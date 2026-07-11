const {
  protect,
  authorizeRoles,
} = require("./authMiddleware");

const PLATFORM_ADMINISTRATION_ROLES = [
  "SuperAdmin",
  "PlatformAdmin",
];

// Use with router.use(...platformAdministrationAccess) so authentication
// always runs before the role check.
const platformAdministrationAccess = [
  protect,
  authorizeRoles(...PLATFORM_ADMINISTRATION_ROLES),
];

module.exports = {
  PLATFORM_ADMINISTRATION_ROLES,
  platformAdministrationAccess,
};
