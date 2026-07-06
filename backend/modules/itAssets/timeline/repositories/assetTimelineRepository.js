/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Timeline Repository
========================================================= */

const { sql, executeQuery } = require("../../../../shared/database/executeQuery");
const { firstOrNull, rows } = require("../../../../shared/database/repositoryBase");

const getAssetSummary = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT TOP 1
        a.AssetId,
        a.AssetTag,
        a.ModelDescription,
        s.StatusName,
        c.CategoryName,
        cond.ConditionName,
        a.CurrentAssignedName,
        a.CurrentAssignedEmployeeCode,
        a.CurrentAssignedEmail,
        a.CurrentRoomId,
        r.RoomName,
        a.CurrentDepartmentId,
        d.DepartmentName,
        a.CurrentLocationId,
        l.LocationName,
        a.CreatedAt,
        a.UpdatedAt
      FROM dbo.ITAssets a
      LEFT JOIN dbo.ITAssetStatuses s ON a.ITAssetStatusId = s.ITAssetStatusId
      LEFT JOIN dbo.ITAssetCategories c ON a.ITAssetCategoryId = c.ITAssetCategoryId
      LEFT JOIN dbo.ITAssetConditions cond ON a.ITAssetConditionId = cond.ITAssetConditionId
      LEFT JOIN dbo.Rooms r ON a.CurrentRoomId = r.RoomId
      LEFT JOIN dbo.Departments d ON a.CurrentDepartmentId = d.DepartmentId
      LEFT JOIN dbo.Locations l ON a.CurrentLocationId = l.LocationId
      WHERE a.AssetId = @AssetId
        AND a.IsDeleted = 0;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return firstOrNull(result);
};

const getAssignmentEvents = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT
        aa.AssetAssignmentId AS ReferenceId,
        aa.AssignedAt AS EventDate,
        'ASSIGNMENT' AS EventGroup,
        CASE
          WHEN aa.ReturnedAt IS NULL THEN 'ASSET_ASSIGNED'
          ELSE 'ASSET_ASSIGNMENT_HISTORY'
        END AS EventType,
        'Asset Assigned' AS Title,
        CONCAT('Assigned to ', ISNULL(aa.AssignedToName, 'Unknown')) AS Description,
        byUser.FullName AS PerformedBy,
        'ITAssetAssignments' AS SourceTable,
        aa.Notes,
        aa.ReturnedAt,
        aa.AssignedToName,
        aa.AssignedToEmail,
        aa.AssignedToEmployeeCode
      FROM dbo.ITAssetAssignments aa
      LEFT JOIN dbo.Users byUser ON aa.AssignedByUserId = byUser.UserId
      WHERE aa.AssetId = @AssetId;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return rows(result);
};

const getBorrowEvents = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT
        b.AssetBorrowId AS ReferenceId,
        b.BorrowedAt AS EventDate,
        'BORROW' AS EventGroup,
        'ASSET_BORROWED' AS EventType,
        'Asset Borrowed' AS Title,
        CONCAT('Borrowed by ', ISNULL(b.BorrowedByName, 'Unknown')) AS Description,
        approvedBy.FullName AS PerformedBy,
        'ITAssetBorrows' AS SourceTable,
        b.Notes,
        b.ExpectedReturnAt,
        b.ReturnedAt,
        b.BorrowedByName,
        b.BorrowedByEmail,
        b.BorrowedByEmployeeCode
      FROM dbo.ITAssetBorrows b
      LEFT JOIN dbo.Users approvedBy ON b.ApprovedByUserId = approvedBy.UserId
      WHERE b.AssetId = @AssetId

      UNION ALL

      SELECT
        b.AssetBorrowId AS ReferenceId,
        b.ReturnedAt AS EventDate,
        'BORROW' AS EventGroup,
        'ASSET_BORROW_RETURNED' AS EventType,
        'Borrowed Asset Returned' AS Title,
        CONCAT('Borrow returned by ', ISNULL(returnedBy.FullName, 'Unknown')) AS Description,
        returnedBy.FullName AS PerformedBy,
        'ITAssetBorrows' AS SourceTable,
        b.ReturnNotes AS Notes,
        b.ExpectedReturnAt,
        b.ReturnedAt,
        b.BorrowedByName,
        b.BorrowedByEmail,
        b.BorrowedByEmployeeCode
      FROM dbo.ITAssetBorrows b
      LEFT JOIN dbo.Users returnedBy ON b.ReturnedByUserId = returnedBy.UserId
      WHERE b.AssetId = @AssetId
        AND b.ReturnedAt IS NOT NULL;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return rows(result);
};

const getTransferEvents = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT
        tr.AssetTransferRequestId AS ReferenceId,
        tr.RequestedAt AS EventDate,
        'TRANSFER' AS EventGroup,
        'ASSET_TRANSFER_REQUESTED' AS EventType,
        'Transfer Requested' AS Title,
        ISNULL(tr.TransferReason, 'Asset transfer requested.') AS Description,
        requestedBy.FullName AS PerformedBy,
        'ITAssetTransferRequests' AS SourceTable,
        tr.TransferStatus AS Notes
      FROM dbo.ITAssetTransferRequests tr
      LEFT JOIN dbo.Users requestedBy ON tr.RequestedBy = requestedBy.UserId
      WHERE tr.AssetId = @AssetId

      UNION ALL

      SELECT
        tr.AssetTransferRequestId AS ReferenceId,
        tr.ApprovedAt AS EventDate,
        'TRANSFER' AS EventGroup,
        'ASSET_TRANSFER_APPROVED' AS EventType,
        'Transfer Approved' AS Title,
        ISNULL(tr.TransferReason, 'Asset transfer approved.') AS Description,
        approvedBy.FullName AS PerformedBy,
        'ITAssetTransferRequests' AS SourceTable,
        tr.TransferStatus AS Notes
      FROM dbo.ITAssetTransferRequests tr
      LEFT JOIN dbo.Users approvedBy ON tr.ApprovedBy = approvedBy.UserId
      WHERE tr.AssetId = @AssetId
        AND tr.ApprovedAt IS NOT NULL

      UNION ALL

      SELECT
        tr.AssetTransferRequestId AS ReferenceId,
        tr.CompletedAt AS EventDate,
        'TRANSFER' AS EventGroup,
        'ASSET_TRANSFER_COMPLETED' AS EventType,
        'Transfer Completed' AS Title,
        ISNULL(tr.TransferReason, 'Asset transfer completed.') AS Description,
        approvedBy.FullName AS PerformedBy,
        'ITAssetTransferRequests' AS SourceTable,
        tr.TransferStatus AS Notes
      FROM dbo.ITAssetTransferRequests tr
      LEFT JOIN dbo.Users approvedBy ON tr.ApprovedBy = approvedBy.UserId
      WHERE tr.AssetId = @AssetId
        AND tr.CompletedAt IS NOT NULL;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return rows(result);
};

const getMaintenanceEvents = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT
        ml.MaintenanceLogId AS ReferenceId,
        ml.PerformedAt AS EventDate,
        'MAINTENANCE' AS EventGroup,
        'ASSET_MAINTENANCE_RECORDED' AS EventType,
        CONCAT('Maintenance: ', ml.MaintenanceType) AS Title,
        ISNULL(ml.Description, 'Maintenance recorded.') AS Description,
        u.FullName AS PerformedBy,
        'ITAssetMaintenanceLogs' AS SourceTable,
        CONCAT('Cost: ', ISNULL(CONVERT(NVARCHAR(50), ml.Cost), '0')) AS Notes,
        ml.NextDueAt
      FROM dbo.ITAssetMaintenanceLogs ml
      LEFT JOIN dbo.Users u ON ml.PerformedBy = u.UserId
      WHERE ml.AssetId = @AssetId;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return rows(result);
};

const getIssueEvents = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT
        il.IssueLogId AS ReferenceId,
        il.ReportedAt AS EventDate,
        'ISSUE' AS EventGroup,
        'ISSUE_REPORTED' AS EventType,
        CONCAT('Issue Reported: ', it.IssueTypeName) AS Title,
        ISNULL(il.Description, 'Issue reported.') AS Description,
        reportedBy.FullName AS PerformedBy,
        'ITAssetIssueLogs' AS SourceTable,
        CONCAT('Status: ', il.IssueStatus, ', Priority: ', il.Priority) AS Notes
      FROM dbo.ITAssetIssueLogs il
      LEFT JOIN dbo.ITAssetIssueTypes it ON il.IssueTypeId = it.IssueTypeId
      LEFT JOIN dbo.Users reportedBy ON il.ReportedByUserId = reportedBy.UserId
      WHERE il.AssetId = @AssetId

      UNION ALL

      SELECT
        il.IssueLogId AS ReferenceId,
        il.ResolvedAt AS EventDate,
        'ISSUE' AS EventGroup,
        'ISSUE_RESOLVED' AS EventType,
        CONCAT('Issue Resolved: ', it.IssueTypeName) AS Title,
        ISNULL(il.Resolution, 'Issue resolved.') AS Description,
        assignedTo.FullName AS PerformedBy,
        'ITAssetIssueLogs' AS SourceTable,
        CONCAT('Status: ', il.IssueStatus, ', Priority: ', il.Priority) AS Notes
      FROM dbo.ITAssetIssueLogs il
      LEFT JOIN dbo.ITAssetIssueTypes it ON il.IssueTypeId = it.IssueTypeId
      LEFT JOIN dbo.Users assignedTo ON il.AssignedToUserId = assignedTo.UserId
      WHERE il.AssetId = @AssetId
        AND il.ResolvedAt IS NOT NULL;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return rows(result);
};

const getNoteEvents = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT
        n.AssetNoteId AS ReferenceId,
        n.CreatedAt AS EventDate,
        'NOTE' AS EventGroup,
        'ASSET_NOTE_ADDED' AS EventType,
        CONCAT('Note: ', nt.NoteTypeName) AS Title,
        n.NoteText AS Description,
        u.FullName AS PerformedBy,
        'ITAssetNotes' AS SourceTable,
        NULL AS Notes
      FROM dbo.ITAssetNotes n
      LEFT JOIN dbo.ITAssetNoteTypes nt ON n.NoteTypeId = nt.NoteTypeId
      LEFT JOIN dbo.Users u ON n.CreatedBy = u.UserId
      WHERE n.AssetId = @AssetId;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return rows(result);
};

const getDisposalEvents = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT
        d.DisposalId AS ReferenceId,
        d.RequestedAt AS EventDate,
        'DISPOSAL' AS EventGroup,
        'DISPOSAL_REQUESTED' AS EventType,
        'Disposal Requested' AS Title,
        ISNULL(d.Reason, 'Disposal requested.') AS Description,
        requestedBy.FullName AS PerformedBy,
        'ITAssetDisposals' AS SourceTable,
        d.DisposalStatus AS Notes
      FROM dbo.ITAssetDisposals d
      LEFT JOIN dbo.Users requestedBy ON d.RequestedBy = requestedBy.UserId
      WHERE d.AssetId = @AssetId

      UNION ALL

      SELECT
        d.DisposalId AS ReferenceId,
        d.ApprovedAt AS EventDate,
        'DISPOSAL' AS EventGroup,
        'DISPOSAL_APPROVED' AS EventType,
        'Disposal Approved / Rejected' AS Title,
        ISNULL(d.Reason, 'Disposal reviewed.') AS Description,
        approvedBy.FullName AS PerformedBy,
        'ITAssetDisposals' AS SourceTable,
        d.DisposalStatus AS Notes
      FROM dbo.ITAssetDisposals d
      LEFT JOIN dbo.Users approvedBy ON d.ApprovedBy = approvedBy.UserId
      WHERE d.AssetId = @AssetId
        AND d.ApprovedAt IS NOT NULL

      UNION ALL

      SELECT
        d.DisposalId AS ReferenceId,
        d.DisposedAt AS EventDate,
        'DISPOSAL' AS EventGroup,
        'ASSET_DISPOSED' AS EventType,
        'Asset Disposed' AS Title,
        ISNULL(d.Reason, 'Asset disposed.') AS Description,
        approvedBy.FullName AS PerformedBy,
        'ITAssetDisposals' AS SourceTable,
        d.DisposalStatus AS Notes
      FROM dbo.ITAssetDisposals d
      LEFT JOIN dbo.Users approvedBy ON d.ApprovedBy = approvedBy.UserId
      WHERE d.AssetId = @AssetId
        AND d.DisposedAt IS NOT NULL;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return rows(result);
};

const getStatusEvents = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT
        sh.AssetStatusHistoryId AS ReferenceId,
        sh.ChangedAt AS EventDate,
        'STATUS' AS EventGroup,
        'STATUS_CHANGED' AS EventType,
        'Status Changed' AS Title,
        CONCAT(
          ISNULL(oldStatus.StatusName, 'None'),
          ' → ',
          ISNULL(newStatus.StatusName, 'Unknown')
        ) AS Description,
        changedBy.FullName AS PerformedBy,
        'ITAssetStatusHistory' AS SourceTable,
        sh.Notes
      FROM dbo.ITAssetStatusHistory sh
      LEFT JOIN dbo.ITAssetStatuses oldStatus ON sh.OldStatusId = oldStatus.ITAssetStatusId
      LEFT JOIN dbo.ITAssetStatuses newStatus ON sh.NewStatusId = newStatus.ITAssetStatusId
      LEFT JOIN dbo.Users changedBy ON sh.ChangedBy = changedBy.UserId
      WHERE sh.AssetId = @AssetId;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return rows(result);
};

module.exports = {
  getAssetSummary,
  getAssignmentEvents,
  getBorrowEvents,
  getTransferEvents,
  getMaintenanceEvents,
  getIssueEvents,
  getNoteEvents,
  getDisposalEvents,
  getStatusEvents,
};