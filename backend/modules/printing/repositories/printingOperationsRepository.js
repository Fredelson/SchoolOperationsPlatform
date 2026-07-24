const { poolPromise, sql } = require("../../../config/db");

const request = (transaction) => new sql.Request(transaction);

const beginTransaction = async () => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  return transaction;
};

const listInventory = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT InventoryId, PaperType, CurrentStock, LastUpdated
    FROM dbo.PaperInventory
    ORDER BY PaperType;
  `);
  return result.recordset;
};

const getInventoryForUpdate = async (transaction, paperType) => {
  const result = await request(transaction)
    .input("PaperType", sql.VarChar(10), paperType)
    .query(`
      SELECT InventoryId, PaperType, CurrentStock
      FROM dbo.PaperInventory WITH (UPDLOCK, HOLDLOCK)
      WHERE PaperType = @PaperType;
    `);
  return result.recordset[0] || null;
};

const setInventoryStock = async (
  transaction,
  inventoryId,
  currentStock
) => {
  const result = await request(transaction)
    .input("InventoryId", sql.Int, inventoryId)
    .input("CurrentStock", sql.Int, currentStock)
    .query(`
      UPDATE dbo.PaperInventory
      SET CurrentStock = @CurrentStock, LastUpdated = GETDATE()
      OUTPUT INSERTED.*
      WHERE InventoryId = @InventoryId;
    `);
  return result.recordset[0] || null;
};

const changeInventoryStock = async (
  transaction,
  inventoryId,
  quantity
) => {
  const result = await request(transaction)
    .input("InventoryId", sql.Int, inventoryId)
    .input("Quantity", sql.Int, quantity)
    .query(`
      UPDATE dbo.PaperInventory
      SET CurrentStock = CurrentStock + @Quantity, LastUpdated = GETDATE()
      OUTPUT INSERTED.*
      WHERE InventoryId = @InventoryId
        AND CurrentStock + @Quantity >= 0;
    `);
  return result.recordset[0] || null;
};

const insertInventoryTransaction = async (
  transaction,
  {
    paperType,
    transactionType,
    quantity,
    previousStock,
    newStock,
    referenceId = null,
    remarks = null,
    createdBy,
  }
) => {
  const result = await request(transaction)
    .input("PaperType", sql.VarChar(10), paperType)
    .input("TransactionType", sql.VarChar(50), transactionType)
    .input("Quantity", sql.Int, quantity)
    .input("PreviousStock", sql.Int, previousStock)
    .input("NewStock", sql.Int, newStock)
    .input("ReferenceId", sql.Int, referenceId)
    .input("Remarks", sql.VarChar(255), String(remarks || "").slice(0, 255))
    .input("CreatedBy", sql.Int, createdBy)
    .query(`
      INSERT INTO dbo.InventoryTransactions (
        PaperType,
        TransactionType,
        Quantity,
        PreviousStock,
        NewStock,
        ReferenceId,
        Remarks,
        CreatedBy,
        CreatedAt
      )
      OUTPUT INSERTED.*
      VALUES (
        @PaperType,
        @TransactionType,
        @Quantity,
        @PreviousStock,
        @NewStock,
        @ReferenceId,
        @Remarks,
        @CreatedBy,
        GETDATE()
      );
    `);
  return result.recordset[0];
};

const listInventoryTransactions = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT
      inventoryTransaction.*,
      creator.FullName AS CreatedByName,
      printingRequest.RequestNumber
    FROM dbo.InventoryTransactions inventoryTransaction
    LEFT JOIN dbo.Users creator
      ON creator.UserId = inventoryTransaction.CreatedBy
    LEFT JOIN dbo.PhotocopyRequests printingRequest
      ON inventoryTransaction.TransactionType = 'DEDUCTION'
     AND printingRequest.RequestId = inventoryTransaction.ReferenceId
    ORDER BY inventoryTransaction.CreatedAt DESC,
      inventoryTransaction.TransactionId DESC;
  `);
  return result.recordset;
};

const listPurchases = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT
      purchase.PurchaseId,
      purchase.PaperType,
      purchase.QuantityBoxes,
      purchase.BundlesPerBox,
      purchase.SheetsPerBundle,
      purchase.TotalBundles,
      purchase.TotalSheets,
      purchase.PurchaseDate,
      purchase.CreatedBy,
      purchase.CreatedAt,
      creator.FullName AS CreatedByName
    FROM dbo.PaperPurchases purchase
    LEFT JOIN dbo.Users creator ON creator.UserId = purchase.CreatedBy
    ORDER BY purchase.PurchaseDate DESC, purchase.PurchaseId DESC;
  `);
  return result.recordset;
};

const insertPurchase = async (
  transaction,
  {
    paperType,
    quantityBoxes,
    bundlesPerBox,
    sheetsPerBundle,
    purchaseDate,
    createdBy,
  }
) => {
  const result = await request(transaction)
    .input("PaperType", sql.VarChar(10), paperType)
    .input("QuantityBoxes", sql.Int, quantityBoxes)
    .input("BundlesPerBox", sql.Int, bundlesPerBox)
    .input("SheetsPerBundle", sql.Int, sheetsPerBundle)
    .input("PurchaseDate", sql.Date, purchaseDate)
    .input("CreatedBy", sql.Int, createdBy)
    .query(`
      INSERT INTO dbo.PaperPurchases (
        PaperType,
        QuantityBoxes,
        BundlesPerBox,
        SheetsPerBundle,
        PurchaseDate,
        CreatedBy,
        CreatedAt
      )
      OUTPUT INSERTED.*
      VALUES (
        @PaperType,
        @QuantityBoxes,
        @BundlesPerBox,
        @SheetsPerBundle,
        @PurchaseDate,
        @CreatedBy,
        GETDATE()
      );
    `);
  return result.recordset[0];
};

const searchDistributionUsers = async (search) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("Search", sql.NVarChar(255), `%${search}%`)
    .query(`
      SELECT TOP 10
        userRecord.UserId,
        userRecord.FullName,
        userRecord.EmployeeId,
        userRecord.DepartmentId,
        department.DepartmentName,
        roleRecord.RoleKey
      FROM dbo.Users userRecord
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = userRecord.DepartmentId
      LEFT JOIN dbo.Roles roleRecord ON roleRecord.RoleId = userRecord.RoleId
      WHERE userRecord.IsActive = 1
        AND ISNULL(userRecord.IsDeleted, 0) = 0
        AND (
          userRecord.EmployeeId LIKE @Search
          OR userRecord.FullName LIKE @Search
        )
      ORDER BY userRecord.FullName;
    `);
  return result.recordset;
};

const getDistributionUser = async (transaction, userId) => {
  const result = await request(transaction)
    .input("UserId", sql.Int, userId)
    .query(`
      SELECT
        userRecord.UserId,
        userRecord.FullName,
        userRecord.EmployeeId,
        userRecord.DepartmentId,
        department.DepartmentName
      FROM dbo.Users userRecord
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = userRecord.DepartmentId
      WHERE userRecord.UserId = @UserId
        AND userRecord.IsActive = 1
        AND ISNULL(userRecord.IsDeleted, 0) = 0;
    `);
  return result.recordset[0] || null;
};

const listDistributions = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT
      distribution.DistributionId,
      distribution.PaperType,
      distribution.BundlesIssued,
      distribution.SheetsPerBundle,
      distribution.BundlesIssued * distribution.SheetsPerBundle AS TotalSheets,
      distribution.IssuedTo,
      distribution.IssuedDate,
      distribution.ReceivedByName,
      distribution.RequestedByUserId,
      distribution.DepartmentId,
      distribution.CreatedAt,
      requester.EmployeeId,
      requester.FullName AS RequestedByFullName,
      department.DepartmentName
    FROM dbo.PaperDistributions distribution
    LEFT JOIN dbo.Users requester
      ON requester.UserId = distribution.RequestedByUserId
    LEFT JOIN dbo.Departments department
      ON department.DepartmentId = distribution.DepartmentId
    ORDER BY distribution.IssuedDate DESC, distribution.DistributionId DESC;
  `);
  return result.recordset;
};

const insertDistribution = async (
  transaction,
  {
    paperType,
    bundlesIssued,
    sheetsPerBundle,
    issuedTo,
    receivedByName,
    requestedByUserId,
    departmentId,
    issuedDate,
  }
) => {
  const result = await request(transaction)
    .input("PaperType", sql.VarChar(10), paperType)
    .input("BundlesIssued", sql.Int, bundlesIssued)
    .input("SheetsPerBundle", sql.Int, sheetsPerBundle)
    .input("IssuedTo", sql.VarChar(100), issuedTo)
    .input("ReceivedByName", sql.VarChar(100), receivedByName)
    .input("RequestedByUserId", sql.Int, requestedByUserId)
    .input("DepartmentId", sql.Int, departmentId)
    .input("IssuedDate", sql.Date, issuedDate)
    .query(`
      INSERT INTO dbo.PaperDistributions (
        PaperType,
        BundlesIssued,
        SheetsPerBundle,
        IssuedTo,
        ReceivedByName,
        RequestedByUserId,
        DepartmentId,
        IssuedDate,
        CreatedAt
      )
      OUTPUT INSERTED.*
      VALUES (
        @PaperType,
        @BundlesIssued,
        @SheetsPerBundle,
        @IssuedTo,
        @ReceivedByName,
        @RequestedByUserId,
        @DepartmentId,
        @IssuedDate,
        GETDATE()
      );
    `);
  return result.recordset[0];
};

const listDepartmentLimits = async (monthNumber, yearNumber) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("MonthNumber", sql.Int, monthNumber)
    .input("YearNumber", sql.Int, yearNumber)
    .query(`
      SELECT
        department.DepartmentId,
        department.DepartmentName,
        ISNULL(departmentLimit.DepartmentLimitId, 0) AS DepartmentLimitId,
        ISNULL(departmentLimit.SheetLimit, 0) AS SheetLimit,
        ISNULL(usageRecord.UsedSheets, 0) AS UsedSheets,
        ISNULL(departmentLimit.SheetLimit, 0)
          - ISNULL(usageRecord.UsedSheets, 0) AS RemainingSheets,
        @MonthNumber AS MonthNumber,
        @YearNumber AS YearNumber
      FROM dbo.Departments department
      LEFT JOIN dbo.DepartmentPrintLimits departmentLimit
        ON departmentLimit.DepartmentId = department.DepartmentId
       AND departmentLimit.MonthNumber = @MonthNumber
       AND departmentLimit.YearNumber = @YearNumber
      LEFT JOIN dbo.vw_DepartmentMonthlyUsage usageRecord
        ON usageRecord.DepartmentId = department.DepartmentId
       AND usageRecord.MonthNumber = @MonthNumber
       AND usageRecord.YearNumber = @YearNumber
      WHERE department.IsActive = 1
      ORDER BY department.DepartmentName;
    `);
  return result.recordset;
};

const upsertDepartmentLimit = async (
  transaction,
  { departmentId, monthNumber, yearNumber, sheetLimit, createdBy }
) => {
  const result = await request(transaction)
    .input("DepartmentId", sql.Int, departmentId)
    .input("MonthNumber", sql.Int, monthNumber)
    .input("YearNumber", sql.Int, yearNumber)
    .input("SheetLimit", sql.Int, sheetLimit)
    .input("CreatedBy", sql.Int, createdBy)
    .query(`
      MERGE dbo.DepartmentPrintLimits WITH (HOLDLOCK) AS target
      USING (
        SELECT
          @DepartmentId AS DepartmentId,
          @MonthNumber AS MonthNumber,
          @YearNumber AS YearNumber
      ) AS source
      ON target.DepartmentId = source.DepartmentId
        AND target.MonthNumber = source.MonthNumber
        AND target.YearNumber = source.YearNumber
      WHEN MATCHED THEN UPDATE SET
        SheetLimit = @SheetLimit,
        UpdatedAt = GETDATE()
      WHEN NOT MATCHED THEN INSERT (
        DepartmentId,
        MonthNumber,
        YearNumber,
        SheetLimit,
        CreatedBy,
        CreatedAt
      )
      VALUES (
        @DepartmentId,
        @MonthNumber,
        @YearNumber,
        @SheetLimit,
        @CreatedBy,
        GETDATE()
      )
      OUTPUT INSERTED.*;
    `);
  return result.recordset[0];
};

const listSubjectLimits = async (
  departmentId,
  monthNumber,
  yearNumber
) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("DepartmentId", sql.Int, departmentId)
    .input("MonthNumber", sql.Int, monthNumber)
    .input("YearNumber", sql.Int, yearNumber)
    .query(`
      SELECT
        subject.SubjectId,
        subject.SubjectName,
        department.DepartmentId,
        department.DepartmentName,
        ISNULL(subjectLimit.SubjectLimitId, 0) AS SubjectLimitId,
        ISNULL(subjectLimit.SheetLimit, 0) AS SheetLimit,
        ISNULL(usageRecord.UsedSheets, 0) AS UsedSheets,
        ISNULL(subjectLimit.SheetLimit, 0)
          - ISNULL(usageRecord.UsedSheets, 0) AS RemainingSheets,
        COALESCE(subjectLimit.HodUserId, assignedHod.UserId) AS HodUserId,
        assignedHod.FullName AS HodName,
        assignedHod.EmployeeId AS HodEmployeeId,
        departmentLimit.DepartmentLimitId,
        ISNULL(departmentLimit.SheetLimit, 0) AS DepartmentSheetLimit,
        @MonthNumber AS MonthNumber,
        @YearNumber AS YearNumber
      FROM dbo.Subjects subject
      JOIN dbo.Departments department
        ON department.DepartmentId = @DepartmentId
       AND department.IsActive = 1
      LEFT JOIN dbo.DepartmentPrintLimits departmentLimit
        ON departmentLimit.DepartmentId = department.DepartmentId
       AND departmentLimit.MonthNumber = @MonthNumber
       AND departmentLimit.YearNumber = @YearNumber
      LEFT JOIN dbo.SubjectPrintLimits subjectLimit
        ON subjectLimit.SubjectId = subject.SubjectId
       AND subjectLimit.DepartmentId = department.DepartmentId
       AND subjectLimit.MonthNumber = @MonthNumber
       AND subjectLimit.YearNumber = @YearNumber
      LEFT JOIN dbo.vw_SubjectMonthlyUsage usageRecord
        ON usageRecord.SubjectId = subject.SubjectId
       AND usageRecord.DepartmentId = department.DepartmentId
       AND usageRecord.MonthNumber = @MonthNumber
       AND usageRecord.YearNumber = @YearNumber
      OUTER APPLY (
        SELECT TOP 1
          userRecord.UserId,
          userRecord.FullName,
          userRecord.EmployeeId
        FROM dbo.UserAssignments assignment
        JOIN dbo.AssignmentTypes assignmentType
          ON assignmentType.AssignmentTypeId = assignment.AssignmentTypeId
         AND assignmentType.AssignmentKey = 'HOD'
         AND assignmentType.IsActive = 1
        JOIN dbo.Users userRecord
          ON userRecord.UserId = assignment.UserId
         AND userRecord.IsActive = 1
         AND ISNULL(userRecord.IsDeleted, 0) = 0
        WHERE assignment.IsActive = 1
          AND EXISTS (
            SELECT 1
            FROM dbo.UserAssignmentScopes departmentScope
            WHERE departmentScope.UserAssignmentId = assignment.UserAssignmentId
              AND departmentScope.IsActive = 1
              AND departmentScope.ScopeType = 'Department'
              AND departmentScope.ScopeEntityId = @DepartmentId
          )
          AND (
            NOT EXISTS (
              SELECT 1
              FROM dbo.UserAssignmentScopes subjectScope
              WHERE subjectScope.UserAssignmentId = assignment.UserAssignmentId
                AND subjectScope.IsActive = 1
                AND subjectScope.ScopeType = 'Subject'
            )
            OR EXISTS (
              SELECT 1
              FROM dbo.UserAssignmentScopes subjectScope
              WHERE subjectScope.UserAssignmentId = assignment.UserAssignmentId
                AND subjectScope.IsActive = 1
                AND subjectScope.ScopeType = 'Subject'
                AND subjectScope.ScopeEntityId = subject.SubjectId
            )
          )
        ORDER BY assignment.IsPrimary DESC, assignment.UserAssignmentId
      ) assignedHod
      WHERE subject.IsActive = 1
      ORDER BY subject.SubjectName;
    `);
  return result.recordset;
};

const getDepartmentLimitForUpdate = async (
  transaction,
  departmentId,
  monthNumber,
  yearNumber
) => {
  const result = await request(transaction)
    .input("DepartmentId", sql.Int, departmentId)
    .input("MonthNumber", sql.Int, monthNumber)
    .input("YearNumber", sql.Int, yearNumber)
    .query(`
      SELECT DepartmentLimitId, SheetLimit
      FROM dbo.DepartmentPrintLimits WITH (UPDLOCK, HOLDLOCK)
      WHERE DepartmentId = @DepartmentId
        AND MonthNumber = @MonthNumber
        AND YearNumber = @YearNumber;
    `);
  return result.recordset[0] || null;
};

const getOtherSubjectLimitTotal = async (
  transaction,
  { departmentId, subjectId, monthNumber, yearNumber }
) => {
  const result = await request(transaction)
    .input("DepartmentId", sql.Int, departmentId)
    .input("SubjectId", sql.Int, subjectId)
    .input("MonthNumber", sql.Int, monthNumber)
    .input("YearNumber", sql.Int, yearNumber)
    .query(`
      SELECT ISNULL(SUM(SheetLimit), 0) AS Total
      FROM dbo.SubjectPrintLimits WITH (UPDLOCK, HOLDLOCK)
      WHERE DepartmentId = @DepartmentId
        AND SubjectId <> @SubjectId
        AND MonthNumber = @MonthNumber
        AND YearNumber = @YearNumber;
    `);
  return Number(result.recordset[0]?.Total || 0);
};

const upsertSubjectLimit = async (
  transaction,
  {
    departmentLimitId,
    departmentId,
    subjectId,
    hodUserId,
    monthNumber,
    yearNumber,
    sheetLimit,
    createdBy,
  }
) => {
  const result = await request(transaction)
    .input("DepartmentLimitId", sql.Int, departmentLimitId)
    .input("DepartmentId", sql.Int, departmentId)
    .input("SubjectId", sql.Int, subjectId)
    .input("HodUserId", sql.Int, hodUserId)
    .input("MonthNumber", sql.Int, monthNumber)
    .input("YearNumber", sql.Int, yearNumber)
    .input("SheetLimit", sql.Int, sheetLimit)
    .input("CreatedBy", sql.Int, createdBy)
    .query(`
      MERGE dbo.SubjectPrintLimits WITH (HOLDLOCK) AS target
      USING (
        SELECT
          @DepartmentId AS DepartmentId,
          @SubjectId AS SubjectId,
          @MonthNumber AS MonthNumber,
          @YearNumber AS YearNumber
      ) AS source
      ON target.DepartmentId = source.DepartmentId
        AND target.SubjectId = source.SubjectId
        AND target.MonthNumber = source.MonthNumber
        AND target.YearNumber = source.YearNumber
      WHEN MATCHED THEN UPDATE SET
        DepartmentLimitId = @DepartmentLimitId,
        HodUserId = @HodUserId,
        SheetLimit = @SheetLimit,
        UpdatedAt = GETDATE()
      WHEN NOT MATCHED THEN INSERT (
        DepartmentLimitId,
        DepartmentId,
        SubjectId,
        HodUserId,
        MonthNumber,
        YearNumber,
        SheetLimit,
        CreatedBy,
        CreatedAt
      )
      VALUES (
        @DepartmentLimitId,
        @DepartmentId,
        @SubjectId,
        @HodUserId,
        @MonthNumber,
        @YearNumber,
        @SheetLimit,
        @CreatedBy,
        GETDATE()
      )
      OUTPUT INSERTED.*;
    `);
  return result.recordset[0];
};

module.exports = {
  beginTransaction,
  listInventory,
  getInventoryForUpdate,
  setInventoryStock,
  changeInventoryStock,
  insertInventoryTransaction,
  listInventoryTransactions,
  listPurchases,
  insertPurchase,
  searchDistributionUsers,
  getDistributionUser,
  listDistributions,
  insertDistribution,
  listDepartmentLimits,
  upsertDepartmentLimit,
  listSubjectLimits,
  getDepartmentLimitForUpdate,
  getOtherSubjectLimitTotal,
  upsertSubjectLimit,
};
