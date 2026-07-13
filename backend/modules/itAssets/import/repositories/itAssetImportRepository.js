/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Import Repository
========================================================= */

const sql = require("mssql");
const { poolPromise } = require("../../../../config/db");

/* =========================================================
   Import Batch
========================================================= */

const createImportBatch = async ({ batchName, originalFileName, uploadedBy }) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("BatchName", sql.NVarChar(300), batchName)
    .input("OriginalFileName", sql.NVarChar(510), originalFileName || null)
    .input("UploadedBy", sql.Int, uploadedBy || null)
    .query(`
      INSERT INTO dbo.ITAssetImportBatches
      (BatchName, OriginalFileName, UploadedBy, TotalRows, ValidRows, InvalidRows, ImportedRows, Status, CreatedAt)
      OUTPUT INSERTED.*
      VALUES (@BatchName, @OriginalFileName, @UploadedBy, 0, 0, 0, 0, 'Pending', GETDATE());
    `);

  return result.recordset[0];
};

const updateBatchStats = async ({
  importBatchId,
  totalRows,
  validRows,
  invalidRows,
  importedRows = 0,
  status = "Validated",
  importedAt = null,
}) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("ImportBatchId", sql.Int, importBatchId)
    .input("TotalRows", sql.Int, totalRows)
    .input("ValidRows", sql.Int, validRows)
    .input("InvalidRows", sql.Int, invalidRows)
    .input("ImportedRows", sql.Int, importedRows)
    .input("Status", sql.NVarChar(100), status)
    .input("ImportedAt", sql.DateTime, importedAt)
    .query(`
      UPDATE dbo.ITAssetImportBatches
      SET TotalRows=@TotalRows,
          ValidRows=@ValidRows,
          InvalidRows=@InvalidRows,
          ImportedRows=@ImportedRows,
          Status=@Status,
          ImportedAt=@ImportedAt
      OUTPUT INSERTED.*
      WHERE ITAssetImportBatchId=@ImportBatchId;
    `);

  return result.recordset[0];
};

/* =========================================================
   Staging
========================================================= */

const insertStagingRows = async ({ importBatchId, rows }) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    for (const row of rows) {
      await new sql.Request(transaction)
        .input("ImportBatchId", sql.Int, importBatchId)
        .input("AssetTag", sql.NVarChar(200), row.assetTag)
        .input("CategoryName", sql.NVarChar(300), row.categoryName)
        .input("BrandName", sql.NVarChar(300), row.brandName)
        .input("ModelName", sql.NVarChar(300), row.modelName)
        .input("DepartmentName", sql.NVarChar(300), row.departmentName)
        .input("LocationName", sql.NVarChar(300), row.locationName)
        .input("RoomName", sql.NVarChar(300), row.roomName)
        .input("StatusName", sql.NVarChar(300), row.statusName)
        .input("ConditionName", sql.NVarChar(300), row.conditionName)
        .input("PurchaseDate", sql.Date, row.purchaseDate || null)
        .input("EmployeeCode", sql.NVarChar(100), row.employeeCode)
        .input("Remarks", sql.NVarChar(sql.MAX), row.remarks)
        .input("SourceSheet", sql.NVarChar(300), row.sourceSheet)
        .input("SourceRow", sql.Int, row.sourceRow)
        .query(`
          INSERT INTO dbo.ITAssetImportStaging
          (
            ImportBatchId, AssetTag, CategoryName, BrandName, ModelName,
            DepartmentName, LocationName, RoomName, StatusName, ConditionName,
            PurchaseDate, EmployeeCode, Remarks, SourceSheet, SourceRow,
            ImportStatus, MatchStatus, DuplicateTagStatus, CreatedAt
          )
          VALUES
          (
            @ImportBatchId, @AssetTag, @CategoryName, @BrandName, @ModelName,
            @DepartmentName, @LocationName, @RoomName, @StatusName, @ConditionName,
            @PurchaseDate, @EmployeeCode, @Remarks, @SourceSheet, @SourceRow,
            'Pending', 'Pending', 'None', GETDATE()
          );
        `);
    }

    await transaction.commit();
    return rows.length;
  } catch (error) {
    if (transaction._aborted !== true) await transaction.rollback();
    throw error;
  }
};

const getStagingRowsByBatchId = async (importBatchId) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("ImportBatchId", sql.Int, importBatchId)
    .query(`
      SELECT *
      FROM dbo.ITAssetImportStaging
      WHERE ImportBatchId=@ImportBatchId
      ORDER BY SourceRow ASC, ImportStagingId ASC;
    `);

  return result.recordset;
};

const updateStagingValidation = async ({
  importStagingId,
  matchedUserId = null,
  matchStatus = "Pending",
  duplicateTagStatus = "None",
  importStatus = "Pending",
  importMessage = null,
  resolvedCategoryId = null,
  resolvedBrandId = null,
  resolvedModelId = null,
  resolvedStatusId = null,
  resolvedConditionId = null,
  resolvedDepartmentId = null,
  resolvedLocationId = null,
  resolvedRoomId = null,
}) => {
  const pool = await poolPromise;

  await pool.request()
    .input("ImportStagingId", sql.Int, importStagingId)
    .input("MatchedUserId", sql.Int, matchedUserId)
    .input("MatchStatus", sql.NVarChar(100), matchStatus)
    .input("DuplicateTagStatus", sql.NVarChar(100), duplicateTagStatus)
    .input("ImportStatus", sql.NVarChar(100), importStatus)
    .input("ImportMessage", sql.NVarChar(sql.MAX), importMessage)
    .input("ResolvedCategoryId", sql.Int, resolvedCategoryId)
    .input("ResolvedBrandId", sql.Int, resolvedBrandId)
    .input("ResolvedModelId", sql.Int, resolvedModelId)
    .input("ResolvedStatusId", sql.Int, resolvedStatusId)
    .input("ResolvedConditionId", sql.Int, resolvedConditionId)
    .input("ResolvedDepartmentId", sql.Int, resolvedDepartmentId)
    .input("ResolvedLocationId", sql.Int, resolvedLocationId)
    .input("ResolvedRoomId", sql.Int, resolvedRoomId)
    .query(`
      UPDATE dbo.ITAssetImportStaging
      SET MatchedUserId=@MatchedUserId,
          MatchStatus=@MatchStatus,
          DuplicateTagStatus=@DuplicateTagStatus,
          ImportStatus=@ImportStatus,
          ImportMessage=@ImportMessage,
          ResolvedCategoryId=@ResolvedCategoryId,
          ResolvedBrandId=@ResolvedBrandId,
          ResolvedModelId=@ResolvedModelId,
          ResolvedStatusId=@ResolvedStatusId,
          ResolvedConditionId=@ResolvedConditionId,
          ResolvedDepartmentId=@ResolvedDepartmentId,
          ResolvedLocationId=@ResolvedLocationId,
          ResolvedRoomId=@ResolvedRoomId
      WHERE ImportStagingId=@ImportStagingId;
    `);
};

/* =========================================================
   Lookup Cache
========================================================= */

const getLookupCache = async () => {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT ITAssetCategoryId, CategoryKey, CategoryName FROM dbo.ITAssetCategories;

    SELECT ITAssetBrandId, BrandName FROM dbo.ITAssetBrands WHERE IsActive = 1;

    SELECT m.ITAssetModelId, m.ITAssetCategoryId, m.ITAssetBrandId, m.ModelName, b.BrandName
    FROM dbo.ITAssetModels m
    LEFT JOIN dbo.ITAssetBrands b ON m.ITAssetBrandId = b.ITAssetBrandId
    WHERE m.IsActive = 1;

    SELECT ITAssetStatusId, StatusKey, StatusName FROM dbo.ITAssetStatuses;

    SELECT ITAssetConditionId, ConditionKey, ConditionName FROM dbo.ITAssetConditions;

    SELECT DepartmentId, DepartmentKey, DepartmentName FROM dbo.Departments WHERE IsActive = 1;

    SELECT LocationId, LocationKey, LocationName FROM dbo.Locations WHERE IsActive = 1;

    SELECT RoomId, RoomKey, RoomName, LocationId FROM dbo.Rooms WHERE IsActive = 1;

    SELECT UserId, FullName, EmployeeId, SchoolEmail, SchoolId
    FROM dbo.Users
    WHERE IsActive = 1;
  `);

  return {
    categories: result.recordsets[0] || [],
    brands: result.recordsets[1] || [],
    models: result.recordsets[2] || [],
    statuses: result.recordsets[3] || [],
    conditions: result.recordsets[4] || [],
    departments: result.recordsets[5] || [],
    locations: result.recordsets[6] || [],
    rooms: result.recordsets[7] || [],
    users: result.recordsets[8] || [],
  };
};

const getExistingAssetTags = async (assetTags = []) => {
  if (!assetTags.length) return [];

  const pool = await poolPromise;
  const request = pool.request();
  const uniqueTags = [...new Set(assetTags.filter(Boolean))];

  const params = uniqueTags.map((tag, index) => {
    const name = `AssetTag${index}`;
    request.input(name, sql.NVarChar(200), tag);
    return `@${name}`;
  });

  const result = await request.query(`
    SELECT AssetTag
    FROM dbo.ITAssets
    WHERE AssetTag IN (${params.join(",")});
  `);

  return result.recordset.map((row) => row.AssetTag);
};

/* =========================================================
   Commit Lookup Cache Helpers
========================================================= */

/* =========================================================
   Commit Lookup Cache Helpers
========================================================= */

const normalizeKey = (value) =>
  String(value || "").trim().toLowerCase();

const slugifyKey = (value) =>
  String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "")
    .substring(0, 200);

const cacheRecord = (map, record, nameField, keyField) => {
  if (!record) return;

  if (record[nameField]) map.set(normalizeKey(record[nameField]), record);
  if (record[keyField]) map.set(normalizeKey(record[keyField]), record);
  if (record[nameField]) map.set(normalizeKey(slugifyKey(record[nameField])), record);
  if (record[keyField]) map.set(normalizeKey(slugifyKey(record[keyField])), record);
};

const loadCommitLookupCache = async (transaction) => {
  const result = await new sql.Request(transaction).query(`
    SELECT ITAssetBrandId, BrandName FROM dbo.ITAssetBrands;
    SELECT ITAssetModelId, ITAssetCategoryId, ITAssetBrandId, ModelName FROM dbo.ITAssetModels;
    SELECT LocationId, LocationKey, LocationName FROM dbo.Locations;
    SELECT RoomId, RoomKey, RoomName, LocationId FROM dbo.Rooms;
    SELECT ITAssetStatusId, StatusKey, StatusName FROM dbo.ITAssetStatuses;
  `);

  const brandMap = new Map();
  const modelMap = new Map();
  const locationMap = new Map();
  const roomMap = new Map();
  const statusMap = new Map();

  for (const brand of result.recordsets[0] || []) {
    brandMap.set(normalizeKey(brand.BrandName), brand);
    brandMap.set(normalizeKey(slugifyKey(brand.BrandName)), brand);
  }

  for (const model of result.recordsets[1] || []) {
    modelMap.set(`${normalizeKey(model.ModelName)}|${model.ITAssetBrandId || ""}`, model);
    modelMap.set(`${normalizeKey(slugifyKey(model.ModelName))}|${model.ITAssetBrandId || ""}`, model);
  }

  for (const location of result.recordsets[2] || []) {
    cacheRecord(locationMap, location, "LocationName", "LocationKey");
  }

  for (const room of result.recordsets[3] || []) {
    cacheRecord(roomMap, room, "RoomName", "RoomKey");
  }

  for (const status of result.recordsets[4] || []) {
    cacheRecord(statusMap, status, "StatusName", "StatusKey");
  }

  return { brandMap, modelMap, locationMap, roomMap, statusMap };
};

const getOrCreateBrandFromCache = async ({ transaction, cache, brandName }) => {
  if (!brandName) return null;

  const cleanName = String(brandName).trim();
  const keys = [normalizeKey(cleanName), normalizeKey(slugifyKey(cleanName))];

  for (const key of keys) {
    if (cache.brandMap.has(key)) return cache.brandMap.get(key);
  }

  const existing = await new sql.Request(transaction)
    .input("BrandName", sql.NVarChar(300), cleanName)
    .query(`
      SELECT TOP 1 ITAssetBrandId, BrandName
      FROM dbo.ITAssetBrands WITH (UPDLOCK, HOLDLOCK)
      WHERE BrandName = @BrandName;
    `);

  if (existing.recordset[0]) {
    const brand = existing.recordset[0];
    cache.brandMap.set(normalizeKey(brand.BrandName), brand);
    cache.brandMap.set(normalizeKey(slugifyKey(brand.BrandName)), brand);
    return brand;
  }

  const created = await new sql.Request(transaction)
    .input("BrandName", sql.NVarChar(300), cleanName)
    .query(`
      INSERT INTO dbo.ITAssetBrands (BrandName, IsActive)
      OUTPUT INSERTED.ITAssetBrandId, INSERTED.BrandName
      VALUES (@BrandName, 1);
    `);

  const brand = created.recordset[0];
  cache.brandMap.set(normalizeKey(brand.BrandName), brand);
  cache.brandMap.set(normalizeKey(slugifyKey(brand.BrandName)), brand);

  return brand;
};

const getOrCreateLocationFromCache = async ({ transaction, cache, locationName }) => {
  if (!locationName) return null;

  const cleanName = String(locationName).trim();
  const generatedKey = slugifyKey(cleanName);
  const keys = [
    normalizeKey(cleanName),
    normalizeKey(generatedKey),
    normalizeKey(cleanName.replace(/\s+/g, "")),
  ];

  for (const key of keys) {
    if (cache.locationMap.has(key)) return cache.locationMap.get(key);
  }

  const existing = await new sql.Request(transaction)
    .input("LocationName", sql.NVarChar(300), cleanName)
    .input("LocationKey", sql.NVarChar(200), generatedKey)
    .query(`
      SELECT TOP 1 LocationId, LocationKey, LocationName
      FROM dbo.Locations WITH (UPDLOCK, HOLDLOCK)
      WHERE LocationName = @LocationName
         OR LocationKey = @LocationKey;
    `);

  if (existing.recordset[0]) {
    const location = existing.recordset[0];
    cacheRecord(cache.locationMap, location, "LocationName", "LocationKey");
    return location;
  }

  const created = await new sql.Request(transaction)
    .input("LocationKey", sql.NVarChar(200), generatedKey)
    .input("LocationName", sql.NVarChar(300), cleanName)
    .query(`
      INSERT INTO dbo.Locations (LocationKey, LocationName, IsActive, CreatedAt)
      OUTPUT INSERTED.LocationId, INSERTED.LocationKey, INSERTED.LocationName
      VALUES (@LocationKey, @LocationName, 1, GETDATE());
    `);

  const location = created.recordset[0];
  cacheRecord(cache.locationMap, location, "LocationName", "LocationKey");

  return location;
};

const getOrCreateRoomFromCache = async ({
  transaction,
  cache,
  roomName,
  locationId = null,
}) => {
  if (!roomName) return null;

  const cleanName = String(roomName).trim();
  const generatedKey = slugifyKey(cleanName);
  const keys = [
    normalizeKey(cleanName),
    normalizeKey(generatedKey),
    normalizeKey(cleanName.replace(/\s+/g, "")),
  ];

  for (const key of keys) {
    if (cache.roomMap.has(key)) return cache.roomMap.get(key);
  }

  const existing = await new sql.Request(transaction)
    .input("RoomName", sql.NVarChar(300), cleanName)
    .input("RoomKey", sql.NVarChar(200), generatedKey)
    .query(`
      SELECT TOP 1 RoomId, RoomKey, RoomName, LocationId
      FROM dbo.Rooms WITH (UPDLOCK, HOLDLOCK)
      WHERE RoomName = @RoomName
         OR RoomKey = @RoomKey;
    `);

  if (existing.recordset[0]) {
    const room = existing.recordset[0];
    cacheRecord(cache.roomMap, room, "RoomName", "RoomKey");
    return room;
  }

  const created = await new sql.Request(transaction)
    .input("LocationId", sql.Int, locationId)
    .input("RoomKey", sql.NVarChar(200), generatedKey)
    .input("RoomName", sql.NVarChar(300), cleanName)
    .query(`
      INSERT INTO dbo.Rooms (LocationId, RoomKey, RoomName, IsActive, CreatedAt)
      OUTPUT INSERTED.RoomId, INSERTED.RoomKey, INSERTED.RoomName, INSERTED.LocationId
      VALUES (@LocationId, @RoomKey, @RoomName, 1, GETDATE());
    `);

  const room = created.recordset[0];
  cacheRecord(cache.roomMap, room, "RoomName", "RoomKey");

  return room;
};

const getOrCreateModelFromCache = async ({
  transaction,
  cache,
  categoryId,
  brandId,
  modelName,
}) => {
  if (!modelName) return null;

  const cleanName = String(modelName).trim();
  const key = `${normalizeKey(cleanName)}|${brandId || ""}`;
  const slugKey = `${normalizeKey(slugifyKey(cleanName))}|${brandId || ""}`;

  if (cache.modelMap.has(key)) return cache.modelMap.get(key);
  if (cache.modelMap.has(slugKey)) return cache.modelMap.get(slugKey);

  const existing = await new sql.Request(transaction)
    .input("ModelName", sql.NVarChar(300), cleanName)
    .input("BrandId", sql.Int, brandId || null)
    .query(`
      SELECT TOP 1 ITAssetModelId, ITAssetCategoryId, ITAssetBrandId, ModelName
      FROM dbo.ITAssetModels WITH (UPDLOCK, HOLDLOCK)
      WHERE ModelName = @ModelName
        AND (@BrandId IS NULL OR ITAssetBrandId = @BrandId);
    `);

  if (existing.recordset[0]) {
    const model = existing.recordset[0];
    cache.modelMap.set(key, model);
    cache.modelMap.set(slugKey, model);
    return model;
  }

  const created = await new sql.Request(transaction)
    .input("ITAssetCategoryId", sql.Int, categoryId)
    .input("ITAssetBrandId", sql.Int, brandId || null)
    .input("ModelName", sql.NVarChar(300), cleanName)
    .query(`
      INSERT INTO dbo.ITAssetModels
      (ITAssetCategoryId, ITAssetBrandId, ModelName, ModelDescription, IsActive)
      OUTPUT INSERTED.ITAssetModelId, INSERTED.ITAssetCategoryId, INSERTED.ITAssetBrandId, INSERTED.ModelName
      VALUES (@ITAssetCategoryId, @ITAssetBrandId, @ModelName, NULL, 1);
    `);

  const model = created.recordset[0];
  cache.modelMap.set(key, model);
  cache.modelMap.set(slugKey, model);

  return model;
};

/* =========================================================
   Commit Import
========================================================= */

const commitValidStagingRows = async ({ importBatchId, importedBy }) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const cache = await loadCommitLookupCache(transaction);

    const stagingResult = await new sql.Request(transaction)
      .input("ImportBatchId", sql.Int, importBatchId)
      .query(`
        SELECT *
        FROM dbo.ITAssetImportStaging
        WHERE ImportBatchId = @ImportBatchId
          AND ImportStatus = 'Valid'
        ORDER BY SourceRow ASC, ImportStagingId ASC;
      `);

    let importedRows = 0;

    for (const row of stagingResult.recordset) {
      const duplicateCheck = await new sql.Request(transaction)
        .input("AssetTag", sql.NVarChar(200), row.AssetTag)
        .query(`
          SELECT TOP 1 AssetId
          FROM dbo.ITAssets
          WHERE AssetTag = @AssetTag;
        `);

      if (duplicateCheck.recordset.length > 0) {
        await new sql.Request(transaction)
          .input("ImportStagingId", sql.Int, row.ImportStagingId)
          .query(`
            UPDATE dbo.ITAssetImportStaging
            SET ImportStatus = 'Invalid',
                DuplicateTagStatus = 'DuplicateInDatabase',
                ImportMessage = 'AssetCode already exists in asset inventory.'
            WHERE ImportStagingId = @ImportStagingId;
          `);

        continue;
      }

      const brand = row.ResolvedBrandId
        ? { ITAssetBrandId: row.ResolvedBrandId, BrandName: row.BrandName }
        : await getOrCreateBrandFromCache({
            transaction,
            cache,
            brandName: row.BrandName,
          });

      const location = row.ResolvedLocationId
        ? { LocationId: row.ResolvedLocationId, LocationName: row.LocationName }
        : await getOrCreateLocationFromCache({
            transaction,
            cache,
            locationName: row.LocationName,
          });

      const room = row.ResolvedRoomId
        ? { RoomId: row.ResolvedRoomId, RoomName: row.RoomName }
        : await getOrCreateRoomFromCache({
            transaction,
            cache,
            roomName: row.RoomName,
            locationId: location?.LocationId || null,
          });

      const model = row.ResolvedModelId
        ? { ITAssetModelId: row.ResolvedModelId, ModelName: row.ModelName }
        : await getOrCreateModelFromCache({
            transaction,
            cache,
            categoryId: row.ResolvedCategoryId,
            brandId: brand?.ITAssetBrandId || null,
            modelName: row.ModelName,
          });

      await new sql.Request(transaction)
        .input("ImportStagingId", sql.Int, row.ImportStagingId)
        .input("ResolvedBrandId", sql.Int, brand?.ITAssetBrandId || null)
        .input("ResolvedModelId", sql.Int, model?.ITAssetModelId || null)
        .input("ResolvedLocationId", sql.Int, location?.LocationId || null)
        .input("ResolvedRoomId", sql.Int, room?.RoomId || null)
        .query(`
          UPDATE dbo.ITAssetImportStaging
          SET ResolvedBrandId = @ResolvedBrandId,
              ResolvedModelId = @ResolvedModelId,
              ResolvedLocationId = @ResolvedLocationId,
              ResolvedRoomId = @ResolvedRoomId
          WHERE ImportStagingId = @ImportStagingId;
        `);

      const userResult = await new sql.Request(transaction)
        .input("MatchedUserId", sql.Int, row.MatchedUserId || null)
        .query(`
          SELECT TOP 1 UserId, FullName, EmployeeId, SchoolEmail, SchoolId
          FROM dbo.Users
          WHERE @MatchedUserId IS NOT NULL
            AND UserId = @MatchedUserId;
        `);

      const user = userResult.recordset[0];
      const assignedStatus = cache.statusMap.get("assigned");
      const hasAssignmentTarget = Boolean(user?.UserId || room?.RoomId);

      if (hasAssignmentTarget && !assignedStatus) {
        throw new Error("Assigned status is missing in ITAssetStatuses.");
      }

      const assetResult = await new sql.Request(transaction)
        .input("AssetTag", sql.NVarChar(200), row.AssetTag)
        .input("ITAssetCategoryId", sql.Int, row.ResolvedCategoryId)
        .input("ITAssetModelId", sql.Int, model?.ITAssetModelId || null)
        .input("ModelDescription", sql.NVarChar(510), model?.ModelName || row.ModelName || null)
        .input("SerialIpMac", sql.NVarChar(510), null)
        .input(
          "ITAssetStatusId",
          sql.Int,
          hasAssignmentTarget
            ? assignedStatus.ITAssetStatusId
            : row.ResolvedStatusId
        )
        .input("ITAssetConditionId", sql.Int, row.ResolvedConditionId || null)
        .input("CurrentAssignedUserId", sql.Int, user?.UserId || null)
        .input("CurrentAssignedName", sql.NVarChar(510), user?.FullName || null)
        .input("CurrentAssignedEmployeeCode", sql.NVarChar(100), user?.EmployeeId || row.EmployeeCode || null)
        .input("CurrentAssignedEmail", sql.NVarChar(510), user?.SchoolEmail || null)
        .input("CurrentRoomId", sql.Int, room?.RoomId || null)
        .input("CurrentDepartmentId", sql.Int, row.ResolvedDepartmentId || null)
        .input("CurrentLocationId", sql.Int, location?.LocationId || null)
        .input("AcquiredChangedDate", sql.Date, row.PurchaseDate || null)
        .input("PreviousOwner", sql.NVarChar(510), null)
        .input("SourceSheet", sql.NVarChar(300), row.SourceSheet || null)
        .input("SourceRow", sql.Int, row.SourceRow || null)
        .input("DuplicateTagStatus", sql.NVarChar(100), row.DuplicateTagStatus || "None")
        .input("OriginalRecordId", sql.Int, null)
        .input("ImportBatchId", sql.Int, importBatchId)
        .input("SchoolId", sql.Int, user?.SchoolId || null)
        .query(`
          INSERT INTO dbo.ITAssets
          (
            AssetTag,
            ITAssetCategoryId,
            ITAssetModelId,
            ModelDescription,
            SerialIpMac,
            ITAssetStatusId,
            ITAssetConditionId,
            CurrentAssignedUserId,
            CurrentAssignedName,
            CurrentAssignedEmployeeCode,
            CurrentAssignedEmail,
            CurrentRoomId,
            CurrentDepartmentId,
            CurrentLocationId,
            AcquiredChangedDate,
            PreviousOwner,
            SourceSheet,
            SourceRow,
            DuplicateTagStatus,
            OriginalRecordId,
            ImportBatchId,
            IsActive,
            CreatedAt,
            UpdatedAt,
            SchoolId
          )
          OUTPUT INSERTED.AssetId
          VALUES
          (
            @AssetTag,
            @ITAssetCategoryId,
            @ITAssetModelId,
            @ModelDescription,
            @SerialIpMac,
            @ITAssetStatusId,
            @ITAssetConditionId,
            @CurrentAssignedUserId,
            @CurrentAssignedName,
            @CurrentAssignedEmployeeCode,
            @CurrentAssignedEmail,
            @CurrentRoomId,
            @CurrentDepartmentId,
            @CurrentLocationId,
            @AcquiredChangedDate,
            @PreviousOwner,
            @SourceSheet,
            @SourceRow,
            @DuplicateTagStatus,
            @OriginalRecordId,
            @ImportBatchId,
            1,
            GETDATE(),
            NULL,
            @SchoolId
          );
        `);

      const assetId = assetResult.recordset[0].AssetId;

      if (row.Remarks) {
        await new sql.Request(transaction)
          .input("AssetId", sql.Int, assetId)
          .input("NoteTypeId", sql.Int, 1)
          .input("NoteText", sql.NVarChar(sql.MAX), row.Remarks)
          .input("CreatedBy", sql.Int, importedBy || null)
          .query(`
            INSERT INTO dbo.ITAssetNotes
            (AssetId, NoteTypeId, NoteText, CreatedBy, CreatedAt)
            VALUES (@AssetId, @NoteTypeId, @NoteText, @CreatedBy, GETDATE());
          `);
      }

      await new sql.Request(transaction)
        .input("ImportStagingId", sql.Int, row.ImportStagingId)
        .query(`
          UPDATE dbo.ITAssetImportStaging
          SET ImportStatus = 'Imported',
              ImportedAt = GETDATE()
          WHERE ImportStagingId = @ImportStagingId;
        `);

      importedRows += 1;
    }

    await new sql.Request(transaction)
      .input("ImportBatchId", sql.Int, importBatchId)
      .input("ImportedRows", sql.Int, importedRows)
      .query(`
        UPDATE dbo.ITAssetImportBatches
        SET ImportedRows = @ImportedRows,
            Status = 'Imported',
            ImportedAt = GETDATE()
        WHERE ITAssetImportBatchId = @ImportBatchId;
      `);

    await transaction.commit();

    return {
      importBatchId,
      importedRows,
    };
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    throw error;
  }
};

/* =========================================================
   Import History
========================================================= */

const getImportHistory = async ({ page = 1, limit = 20 }) => {
  const pool = await poolPromise;
  const offset = (Number(page) - 1) * Number(limit);

  const result = await pool.request()
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, Number(limit))
    .query(`
      SELECT b.ITAssetImportBatchId, b.BatchName, b.OriginalFileName,
             b.UploadedBy, u.FullName AS UploadedByName,
             b.TotalRows, b.ValidRows, b.InvalidRows, b.ImportedRows,
             b.Status, b.CreatedAt, b.ImportedAt
      FROM dbo.ITAssetImportBatches b
      LEFT JOIN dbo.Users u ON b.UploadedBy = u.UserId
      ORDER BY b.CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

      SELECT COUNT(1) AS Total FROM dbo.ITAssetImportBatches;
    `);

  return {
    rows: result.recordsets[0],
    total: result.recordsets[1][0].Total,
  };
};

module.exports = {
  createImportBatch,
  updateBatchStats,
  insertStagingRows,
  getStagingRowsByBatchId,
  updateStagingValidation,
  getLookupCache,
  getExistingAssetTags,
  commitValidStagingRows,
  getImportHistory,
};
