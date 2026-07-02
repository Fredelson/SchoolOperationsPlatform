// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Mapper
// ============================================

function mapButton(row) {
  if (!row) return null;

  return {
    buttonId: row.ButtonId,
    moduleId: row.ModuleId,
    moduleName: row.ModuleName || null,
    buttonKey: row.ButtonKey,
    buttonName: row.ButtonName,
    permissionId: row.PermissionId || null,
    permissionName: row.PermissionName || null,
    permissionKey: row.PermissionKey || null,
    featureFlagId: row.FeatureFlagId || null,
    featureFlagName: row.FeatureFlagName || null,
    featureFlagKey: row.FeatureFlagKey || null,
    visibilityStatusId: row.VisibilityStatusId,
    visibilityStatusName: row.VisibilityStatusName || null,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt || null,
  };
}

function mapButtons(rows = []) {
  return rows.map(mapButton);
}

module.exports = {
  mapButton,
  mapButtons,
};