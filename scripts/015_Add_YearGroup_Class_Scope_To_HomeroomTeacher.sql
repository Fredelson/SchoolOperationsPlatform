SET NOCOUNT ON;

PRINT N'=== Fixing Homeroom Teacher Assignment Scope Types ===';

-- Homeroom Teacher (AssignmentTypeId = 3) should have:
-- - Section (required) - already exists
-- - YearGroup (required) - needs to be added
-- - Class (required) - needs to be added

-- Add YearGroup for Homeroom Teacher
IF NOT EXISTS (
  SELECT 1 FROM dbo.AssignmentTypeScopeTypes
  WHERE AssignmentTypeId = 3 AND ScopeType = 'YearGroup'
)
BEGIN
  INSERT INTO dbo.AssignmentTypeScopeTypes (
    AssignmentTypeId, ScopeType, IsRequired, SortOrder, IsActive, CreatedAt, UpdatedAt
  )
  VALUES (
    3, 'YearGroup', 1, 10, 1, GETDATE(), GETDATE()
  );

  PRINT N'Added YearGroup scope type for Homeroom Teacher (AssignmentTypeId = 3).';
END
ELSE
BEGIN
  PRINT N'YearGroup scope type already exists for Homeroom Teacher.';
END;

-- Add Class for Homeroom Teacher
IF NOT EXISTS (
  SELECT 1 FROM dbo.AssignmentTypeScopeTypes
  WHERE AssignmentTypeId = 3 AND ScopeType = 'Class'
)
BEGIN
  INSERT INTO dbo.AssignmentTypeScopeTypes (
    AssignmentTypeId, ScopeType, IsRequired, SortOrder, IsActive, CreatedAt, UpdatedAt
  )
  VALUES (
    3, 'Class', 1, 20, 1, GETDATE(), GETDATE()
  );

  PRINT N'Added Class scope type for Homeroom Teacher (AssignmentTypeId = 3).';
END
ELSE
BEGIN
  PRINT N'Class scope type already exists for Homeroom Teacher.';
END;

-- Show current Homeroom Teacher scope types
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
WHERE ats.AssignmentTypeId = 3
ORDER BY ats.SortOrder;
