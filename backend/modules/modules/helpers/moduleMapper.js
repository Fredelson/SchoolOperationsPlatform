// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Mapper
// ============================================

const mapModule = (row) => {
  if (!row) return null;

  return {
    moduleId: row.ModuleId,
    moduleKey: row.ModuleKey,
    moduleName: row.ModuleName,
    description: row.Description,
    icon: row.Icon,
    baseRoute: row.BaseRoute,
    visibilityStatusId: row.VisibilityStatusId,
    visibilityStatusKey: row.VisibilityStatusKey,
    visibilityStatusName: row.VisibilityStatusName,
    isActive: Boolean(row.IsActive),
    sortOrder: row.SortOrder,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
};

module.exports = {
  mapModule,
  mapModules: (rows = []) => rows.map(mapModule),
};