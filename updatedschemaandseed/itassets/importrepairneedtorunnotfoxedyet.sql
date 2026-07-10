INSERT INTO dbo.ITAssetAssignments
(
    AssetId,
    AssignmentTargetType,
    AssignedToUserId,
    AssignedToName,
    AssignedToEmail,
    AssignedToEmployeeCode,
    RoomId,
    DepartmentId,
    LocationId,
    AssignedByUserId,
    AssignedAt,
    ReturnedAt,
    Notes
)
SELECT
    a.AssetId,
    'USER',
    a.CurrentAssignedUserId,
    a.CurrentAssignedName,
    a.CurrentAssignedEmail,
    a.CurrentAssignedEmployeeCode,
    a.CurrentRoomId,
    a.CurrentDepartmentId,
    a.CurrentLocationId,
    NULL,
    ISNULL(a.UpdatedAt, a.CreatedAt),
    NULL,
    'Backfilled active assignment from existing ITAssets current assignment fields.'
FROM dbo.ITAssets a
WHERE a.IsDeleted = 0
  AND (
        a.CurrentAssignedUserId IS NOT NULL
        OR NULLIF(LTRIM(RTRIM(a.CurrentAssignedName)), '') IS NOT NULL
      )
  AND NOT EXISTS (
        SELECT 1
        FROM dbo.ITAssetAssignments aa
        WHERE aa.AssetId = a.AssetId
          AND aa.ReturnedAt IS NULL
  );