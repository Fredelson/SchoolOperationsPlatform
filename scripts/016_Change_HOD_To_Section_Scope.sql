SET NOCOUNT ON;

PRINT N'=== Modifying HOD Assignment Scope Types ===';

-- Remove Department from HOD and add Section instead
IF EXISTS (
  SELECT 1 FROM dbo.AssignmentTypeScopeTypes
  WHERE AssignmentTypeId = 1 AND ScopeType = 'Department'
)
BEGIN
  DELETE FROM dbo.AssignmentTypeScopeTypes
  WHERE AssignmentTypeId = 1 AND ScopeType = 'Department';

  PRINT N'Removed Department scope type from HOD (AssignmentTypeId = 1).';
END;

-- Add Section for HOD (single selection, not multiple)
IF NOT EXISTS (
  SELECT 1 FROM dbo.AssignmentTypeScopeTypes
  WHERE AssignmentTypeId = 1 AND ScopeType = 'Section'
)
BEGIN
  INSERT INTO dbo.AssignmentTypeScopeTypes (
    AssignmentTypeId, ScopeType, IsRequired, SortOrder, IsActive, CreatedAt, UpdatedAt
  )
  VALUES (
    1, 'Section', 1, 10, 1, GETDATE(), GETDATE()
  );

  PRINT N'Added Section scope type for HOD (AssignmentTypeId = 1).';
END
ELSE
BEGIN
  PRINT N'Section scope type already exists for HOD.';
END;

-- Show current HOD scope types
SELECT 
  ats.AssignmentTypeScopeTypeId,
  ats.AssignmentTypeId,
  at.AssignmentKey,
  at.AssignmentName,
  ats.ScopeType,
  ats.IsRequired,
  ats.SortOrder,
  ats.IsActive
FROM dbo.AssignmentTypeScopeTypes ats
INNER JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId = ats.AssignmentTypeId
WHERE ats.AssignmentTypeId = 1
ORDER BY ats.SortOrder;
