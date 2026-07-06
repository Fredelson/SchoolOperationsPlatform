/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Assignment History Repository
========================================================= */

const { sql, executeQuery } = require("../../../../shared/database/executeQuery");
const { rows, firstOrNull } = require("../../../../shared/database/repositoryBase");

const getAssignmentHistory = async ({ assetId = null, page = 1, limit = 20 }) => {
  const offset = (Number(page) - 1) * Number(limit);

  const result = await executeQuery(
    `
      SELECT
        aa.AssetAssignmentId,
        aa.AssetId,
        a.AssetTag,
        a.ModelDescription,
        aa.AssignmentTargetType,
        aa.AssignedToUserId,
        aa.AssignedToName,
        aa.AssignedToEmail,
        aa.AssignedToEmployeeCode,
        aa.RoomId,
        r.RoomName,
        aa.DepartmentId,
        d.DepartmentName,
        aa.LocationId,
        l.LocationName,
        aa.AssignedByUserId,
        assignedBy.FullName AS AssignedByName,
        aa.AssignedAt,
        aa.ReturnedAt,
        aa.Notes
      FROM dbo.ITAssetAssignments aa
      INNER JOIN dbo.ITAssets a ON aa.AssetId = a.AssetId
      LEFT JOIN dbo.Users assignedBy ON aa.AssignedByUserId = assignedBy.UserId
      LEFT JOIN dbo.Rooms r ON aa.RoomId = r.RoomId
      LEFT JOIN dbo.Departments d ON aa.DepartmentId = d.DepartmentId
      LEFT JOIN dbo.Locations l ON aa.LocationId = l.LocationId
      WHERE a.IsDeleted = 0
        AND (@AssetId IS NULL OR aa.AssetId = @AssetId)
      ORDER BY aa.AssignedAt DESC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY;
    `,
    [
      { name: "AssetId", type: sql.Int, value: assetId ? Number(assetId) : null },
      { name: "Offset", type: sql.Int, value: offset },
      { name: "Limit", type: sql.Int, value: Number(limit) },
    ]
  );

  return rows(result);
};

const countAssignmentHistory = async ({ assetId = null }) => {
  const result = await executeQuery(
    `
      SELECT COUNT(1) AS Total
      FROM dbo.ITAssetAssignments aa
      INNER JOIN dbo.ITAssets a ON aa.AssetId = a.AssetId
      WHERE a.IsDeleted = 0
        AND (@AssetId IS NULL OR aa.AssetId = @AssetId);
    `,
    [{ name: "AssetId", type: sql.Int, value: assetId ? Number(assetId) : null }]
  );

  return firstOrNull(result)?.Total || 0;
};

const getActiveAssignments = async ({ page = 1, limit = 20 }) => {
  const offset = (Number(page) - 1) * Number(limit);

  const result = await executeQuery(
    `
      SELECT
        aa.AssetAssignmentId,
        aa.AssetId,
        a.AssetTag,
        a.ModelDescription,
        aa.AssignmentTargetType,
        aa.AssignedToUserId,
        aa.AssignedToName,
        aa.AssignedToEmail,
        aa.AssignedToEmployeeCode,
        aa.RoomId,
        r.RoomName,
        aa.DepartmentId,
        d.DepartmentName,
        aa.LocationId,
        l.LocationName,
        aa.AssignedByUserId,
        assignedBy.FullName AS AssignedByName,
        aa.AssignedAt,
        aa.Notes
      FROM dbo.ITAssetAssignments aa
      INNER JOIN dbo.ITAssets a ON aa.AssetId = a.AssetId
      LEFT JOIN dbo.Users assignedBy ON aa.AssignedByUserId = assignedBy.UserId
      LEFT JOIN dbo.Rooms r ON aa.RoomId = r.RoomId
      LEFT JOIN dbo.Departments d ON aa.DepartmentId = d.DepartmentId
      LEFT JOIN dbo.Locations l ON aa.LocationId = l.LocationId
      WHERE a.IsDeleted = 0
        AND aa.ReturnedAt IS NULL
      ORDER BY aa.AssignedAt DESC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY;
    `,
    [
      { name: "Offset", type: sql.Int, value: offset },
      { name: "Limit", type: sql.Int, value: Number(limit) },
    ]
  );

  return rows(result);
};

const countActiveAssignments = async () => {
  const result = await executeQuery(
    `
      SELECT COUNT(1) AS Total
      FROM dbo.ITAssetAssignments aa
      INNER JOIN dbo.ITAssets a ON aa.AssetId = a.AssetId
      WHERE a.IsDeleted = 0
        AND aa.ReturnedAt IS NULL;
    `
  );

  return firstOrNull(result)?.Total || 0;
};

const getStatusHistory = async ({ assetId = null, page = 1, limit = 20 }) => {
  const offset = (Number(page) - 1) * Number(limit);

  const result = await executeQuery(
    `
      SELECT
        sh.AssetStatusHistoryId,
        sh.AssetId,
        a.AssetTag,
        a.ModelDescription,
        sh.OldStatusId,
        oldStatus.StatusName AS OldStatusName,
        oldStatus.StatusKey AS OldStatusKey,
        sh.NewStatusId,
        newStatus.StatusName AS NewStatusName,
        newStatus.StatusKey AS NewStatusKey,
        sh.ChangedBy,
        changedBy.FullName AS ChangedByName,
        sh.ChangedAt,
        sh.Notes
      FROM dbo.ITAssetStatusHistory sh
      INNER JOIN dbo.ITAssets a ON sh.AssetId = a.AssetId
      LEFT JOIN dbo.ITAssetStatuses oldStatus ON sh.OldStatusId = oldStatus.ITAssetStatusId
      LEFT JOIN dbo.ITAssetStatuses newStatus ON sh.NewStatusId = newStatus.ITAssetStatusId
      LEFT JOIN dbo.Users changedBy ON sh.ChangedBy = changedBy.UserId
      WHERE a.IsDeleted = 0
        AND (@AssetId IS NULL OR sh.AssetId = @AssetId)
      ORDER BY sh.ChangedAt DESC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY;
    `,
    [
      { name: "AssetId", type: sql.Int, value: assetId ? Number(assetId) : null },
      { name: "Offset", type: sql.Int, value: offset },
      { name: "Limit", type: sql.Int, value: Number(limit) },
    ]
  );

  return rows(result);
};

const countStatusHistory = async ({ assetId = null }) => {
  const result = await executeQuery(
    `
      SELECT COUNT(1) AS Total
      FROM dbo.ITAssetStatusHistory sh
      INNER JOIN dbo.ITAssets a ON sh.AssetId = a.AssetId
      WHERE a.IsDeleted = 0
        AND (@AssetId IS NULL OR sh.AssetId = @AssetId);
    `,
    [{ name: "AssetId", type: sql.Int, value: assetId ? Number(assetId) : null }]
  );

  return firstOrNull(result)?.Total || 0;
};

module.exports = {
  getAssignmentHistory,
  countAssignmentHistory,
  getActiveAssignments,
  countActiveAssignments,
  getStatusHistory,
  countStatusHistory,
};