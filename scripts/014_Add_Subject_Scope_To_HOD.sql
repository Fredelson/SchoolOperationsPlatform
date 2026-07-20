SET NOCOUNT ON;

PRINT N'=== Fixing HOD Assignment Scope Types ===';

-- HOD (AssignmentTypeId = 1) should have both Department and Subject as scope types
-- Currently only Department exists. Add Subject if missing.

IF NOT EXISTS (
  SELECT 1 FROM dbo.AssignmentTypeScopeTypes
  WHERE AssignmentTypeId = 1 AND ScopeType = 'Subject'
)
BEGIN
  INSERT INTO dbo.AssignmentTypeScopeTypes (
    AssignmentTypeId, ScopeType, IsRequired, SortOrder, IsActive, CreatedAt, UpdatedAt
  )
  VALUES (
    1, 'Subject', 1, 20, 1, GETDATE(), GETDATE()
  );

  PRINT N'Added Subject scope type for HOD (AssignmentTypeId = 1).';
END
ELSE
BEGIN
  PRINT N'Subject scope type already exists for HOD.';
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
