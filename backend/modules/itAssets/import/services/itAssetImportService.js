/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Import Service
========================================================= */

const XLSX = require("xlsx");
const repository = require("../repositories/itAssetImportRepository");
const validator = require("../validators/itAssetImportValidator");

const STATUS_ALIASES = {
  "under maintenance": "Under Repair",
  maintenance: "Under Repair",
  "under repair": "Under Repair",
};

const CONDITION_ALIASES = {
  "needs repair": "Need Parts",
  "repair needed": "Need Parts",
  broken: "Need Parts",
  retired: "Beyond Repair",
  poor: "Need Maintenance",
  "need maintenance": "Need Maintenance",
};

const normalizeCompare = (value) =>
  value === null || value === undefined
    ? ""
    : String(value).trim().toLowerCase();

const normalizeExcelDate = (value) => {
  if (!value) return null;

  if (!Number.isNaN(Number(value))) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    excelEpoch.setUTCDate(excelEpoch.getUTCDate() + Number(value));
    return excelEpoch.toISOString().slice(0, 10);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
};

const findByNameOrKey = (items, value, nameField, keyField) => {
  const target = normalizeCompare(value);
  if (!target) return null;

  return items.find(
    (item) =>
      normalizeCompare(item[nameField]) === target ||
      normalizeCompare(item[keyField]) === target
  );
};

const findBrand = (brands, brandName) => {
  if (!brandName) return null;

  return brands.find(
    (brand) => normalizeCompare(brand.BrandName) === normalizeCompare(brandName)
  );
};

const findModel = (models, modelName, brandId = null) => {
  if (!modelName) return null;

  return models.find((model) => {
    const sameName =
      normalizeCompare(model.ModelName) === normalizeCompare(modelName);

    if (!sameName) return false;

    if (!brandId) return true;

    return Number(model.ITAssetBrandId) === Number(brandId);
  });
};

const lookupName = (items, id, nameField) => {
  if (!id && id !== 0) return null;
  const item = items.find((i) => Number(i[nameField.replace("Name", "Id")] || i.ITAssetCategoryId || i.ITAssetStatusId || i.ITAssetConditionId || i.DepartmentId || i.LocationId || i.RoomId || i.UserId) === Number(id));
  return item ? item[nameField] : String(id);
};

const getCategoryName = (id, categories) => {
  const cat = categories.find((c) => c.ITAssetCategoryId === Number(id));
  return cat ? cat.CategoryName : String(id);
};

const getStatusName = (id, statuses) => {
  const s = statuses.find((st) => st.ITAssetStatusId === Number(id));
  return s ? s.StatusName : String(id);
};

const getConditionName = (id, conditions) => {
  const c = conditions.find((co) => co.ITAssetConditionId === Number(id));
  return c ? c.ConditionName : String(id);
};

const getDepartmentName = (id, departments) => {
  const d = departments.find((dept) => dept.DepartmentId === Number(id));
  return d ? d.DepartmentName : String(id);
};

const getLocationName = (id, locations) => {
  const l = locations.find((loc) => loc.LocationId === Number(id));
  return l ? l.LocationName : String(id);
};

const getRoomName = (id, rooms) => {
  const r = rooms.find((rm) => rm.RoomId === Number(id));
  return r ? r.RoomName : String(id);
};

const getUserName = (id, users) => {
  const u = users.find((usr) => usr.UserId === Number(id));
  return u ? usr.FullName : String(id);
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
};

const compareAssetWithImport = (existingAsset, row, lookups) => {
  const changes = [];

  const existingCategory = getCategoryName(existingAsset.ITAssetCategoryId, lookups.categories);
  if (existingCategory !== row.CategoryName) {
    changes.push({ field: "Category", oldValue: existingCategory, newValue: row.CategoryName });
  }

  const existingModel = lookups.models.find(
    (m) => m.ITAssetModelId === Number(existingAsset.ITAssetModelId)
  );
  const existingModelName = existingModel ? existingModel.ModelName : String(existingAsset.ITAssetModelId);
  if (existingModelName !== row.ModelName) {
    changes.push({ field: "Model", oldValue: existingModelName, newValue: row.ModelName });
  }

  const existingStatus = getStatusName(existingAsset.ITAssetStatusId, lookups.statuses);
  if (existingStatus !== row.StatusName) {
    changes.push({ field: "Status", oldValue: existingStatus, newValue: row.StatusName });
  }

  const existingCondition = getConditionName(existingAsset.ITAssetConditionId, lookups.conditions);
  if (existingCondition !== row.ConditionName) {
    changes.push({ field: "Condition", oldValue: existingCondition, newValue: row.ConditionName });
  }

  const existingDepartment = getDepartmentName(existingAsset.CurrentDepartmentId, lookups.departments);
  if (existingDepartment !== row.DepartmentName) {
    changes.push({ field: "Department", oldValue: existingDepartment, newValue: row.DepartmentName });
  }

  const existingLocation = getLocationName(existingAsset.CurrentLocationId, lookups.locations);
  if (existingLocation !== row.LocationName) {
    changes.push({ field: "Location", oldValue: existingLocation, newValue: row.LocationName });
  }

  const existingRoom = getRoomName(existingAsset.CurrentRoomId, lookups.rooms);
  if (existingRoom !== row.RoomName) {
    changes.push({ field: "Room", oldValue: existingRoom, newValue: row.RoomName });
  }

  const existingUser = getUserName(existingAsset.CurrentAssignedUserId, lookups.users);
  if (existingUser !== row.EmployeeCode) {
    changes.push({ field: "AssignedTo", oldValue: existingUser, newValue: row.EmployeeCode });
  }

  const existingDate = formatDate(existingAsset.AcquiredChangedDate);
  const importDate = row.PurchaseDate || "";
  if (existingDate !== importDate) {
    changes.push({ field: "PurchaseDate", oldValue: existingDate || "Not set", newValue: importDate || "Not set" });
  }

  return changes;
};

const parseWorkbookRows = (file) => {
  const workbook = XLSX.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: null,
    raw: false,
  });

  const headers = rows.length ? Object.keys(rows[0]) : [];

  return {
    sheetName,
    headers,
    rows,
  };
};

const uploadAndPreview = async ({ file, userId }) => {
  const fileErrors = validator.validateUploadedFile(file);

  if (fileErrors.length) {
    return {
      success: false,
      errors: fileErrors,
    };
  }

  const parsed = parseWorkbookRows(file);
  const headerErrors = validator.validateHeaders(parsed.headers);

  if (headerErrors.length) {
    return {
      success: false,
      errors: headerErrors,
    };
  }

  const batch = await repository.createImportBatch({
    batchName: `IT Asset Import - ${new Date().toISOString()}`,
    originalFileName: file.originalname,
    uploadedBy: userId,
  });

  const normalizedRows = parsed.rows.map((row, index) => {
    const normalized = validator.normalizeImportRow(
      row,
      parsed.sheetName,
      index + 2
    );

    return {
      ...normalized,
      purchaseDate: normalizeExcelDate(normalized.purchaseDate),
    };
  });

  await repository.insertStagingRows({
    importBatchId: batch.ITAssetImportBatchId,
    rows: normalizedRows,
  });

  return validateBatch(batch.ITAssetImportBatchId);
};

const validateBatch = async (importBatchId) => {
  const stagingRows = await repository.getStagingRowsByBatchId(importBatchId);
  const lookups = await repository.getLookupCache();

  const assetTags = stagingRows.map((row) => row.AssetTag).filter(Boolean);
  const existingAssets = await repository.getExistingAssetsByTags(assetTags);
  const existingAssetsByTag = new Map();
  for (const asset of existingAssets) {
    existingAssetsByTag.set(normalizeCompare(asset.AssetTag), asset);
  }

  const fileTagCounts = assetTags.reduce((acc, tag) => {
    const key = normalizeCompare(tag);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  let validRows = 0;
  let invalidRows = 0;
  let updateRows = 0;
  let ignoredRows = 0;

  const previewData = [];

  for (const row of stagingRows) {
    const errors = [];
    const warnings = [];
    let changes = [];
    let importStatus = "Valid";
    let matchStatus = "NotProvided";
    let matchedUserId = null;
    let duplicateTagStatus = "None";

    let resolvedCategoryId = null;
    let resolvedBrandId = null;
    let resolvedModelId = null;
    let resolvedStatusId = null;
    let resolvedConditionId = null;
    let resolvedDepartmentId = null;
    let resolvedLocationId = null;
    let resolvedRoomId = null;

    if (!row.AssetTag) {
      errors.push("AssetCode is required.");
    }

    if (!row.CategoryName) {
      errors.push("Category is required.");
    }

    if (!row.StatusName) {
      errors.push("Status is required.");
    }

    const tagKey = normalizeCompare(row.AssetTag);

    if (row.AssetTag && fileTagCounts[tagKey] > 1) {
      duplicateTagStatus = "DuplicateInFile";
      errors.push("Duplicate AssetCode inside uploaded file.");
    }

    const existingAsset = existingAssetsByTag.get(tagKey);

    if (existingAsset) {
      duplicateTagStatus = "DuplicateInDatabase";

      if (errors.length === 0) {
        changes = compareAssetWithImport(existingAsset, row, lookups);

        if (changes.length > 0) {
          importStatus = "Update";
          updateRows++;
        } else {
          importStatus = "Ignored";
          ignoredRows++;
        }
      }
    }

    const category = findByNameOrKey(
      lookups.categories,
      row.CategoryName,
      "CategoryName",
      "CategoryKey"
    );

    if (category) {
      resolvedCategoryId = category.ITAssetCategoryId;
    } else if (row.CategoryName) {
      errors.push(`Category '${row.CategoryName}' was not found.`);
    }

    const normalizedStatusName =
      STATUS_ALIASES[normalizeCompare(row.StatusName)] || row.StatusName;

    const status = findByNameOrKey(
      lookups.statuses,
      normalizedStatusName,
      "StatusName",
      "StatusKey"
    );

    if (status) {
      resolvedStatusId = status.ITAssetStatusId;
    } else if (row.StatusName) {
      errors.push(`Status '${row.StatusName}' was not found.`);
    }

    const normalizedConditionName =
      CONDITION_ALIASES[normalizeCompare(row.ConditionName)] ||
      row.ConditionName;

    const condition = row.ConditionName
      ? findByNameOrKey(
          lookups.conditions,
          normalizedConditionName,
          "ConditionName",
          "ConditionKey"
        )
      : null;

    if (condition) {
      resolvedConditionId = condition.ITAssetConditionId;
    } else if (row.ConditionName) {
      errors.push(`Condition '${row.ConditionName}' was not found.`);
    }

    const department = row.DepartmentName
      ? findByNameOrKey(
          lookups.departments,
          row.DepartmentName,
          "DepartmentName",
          "DepartmentKey"
        )
      : null;

    if (department) {
      resolvedDepartmentId = department.DepartmentId;
    } else if (row.DepartmentName) {
      errors.push(`Department '${row.DepartmentName}' was not found.`);
    }

    const brand = findBrand(lookups.brands, row.BrandName);

    if (brand) {
      resolvedBrandId = brand.ITAssetBrandId;
    } else if (row.BrandName) {
      warnings.push(`Brand '${row.BrandName}' will be auto-created.`);
    }

    const model = findModel(lookups.models, row.ModelName, resolvedBrandId);

    if (model) {
      resolvedModelId = model.ITAssetModelId;
    } else if (row.ModelName) {
      warnings.push(`Model '${row.ModelName}' will be auto-created.`);
    }

    const location = row.LocationName
      ? findByNameOrKey(
          lookups.locations,
          row.LocationName,
          "LocationName",
          "LocationKey"
        )
      : null;

    if (location) {
      resolvedLocationId = location.LocationId;
    } else if (row.LocationName) {
      warnings.push(`Location '${row.LocationName}' will be auto-created.`);
    }

    const room = row.RoomName
      ? findByNameOrKey(lookups.rooms, row.RoomName, "RoomName", "RoomKey")
      : null;

    if (room) {
      resolvedRoomId = room.RoomId;
    } else if (row.RoomName) {
      warnings.push(`Room '${row.RoomName}' will be auto-created.`);
    }

    const user = row.EmployeeCode
      ? lookups.users.find(
          (item) =>
            normalizeCompare(item.EmployeeId) ===
            normalizeCompare(row.EmployeeCode)
        )
      : null;

    if (row.EmployeeCode && !user) {
      matchStatus = "NotMatched";
      warnings.push(
        `EmployeeCode '${row.EmployeeCode}' was not found. Asset will import without assignment.`
      );
    }

    if (user) {
      matchStatus = "Matched";
      matchedUserId = user.UserId;
    }

    if (errors.length > 0 && importStatus !== "Update" && importStatus !== "Ignored") {
      importStatus = "Invalid";
    } else if (errors.length > 0 && (importStatus === "Update" || importStatus === "Ignored")) {
      const previousStatus = importStatus;
      importStatus = "Invalid";
      if (previousStatus === "Update") {
        updateRows--;
      } else {
        ignoredRows--;
      }
    }

    const message = [...errors, ...warnings].join(" ");

    if (importStatus === "Valid") {
      validRows += 1;
    } else if (importStatus === "Invalid") {
      invalidRows += 1;
    }

    await repository.updateStagingValidation({
      importStagingId: row.ImportStagingId,
      matchedUserId,
      matchStatus,
      duplicateTagStatus,
      importStatus,
      importMessage: message,
      resolvedCategoryId,
      resolvedBrandId,
      resolvedModelId,
      resolvedStatusId,
      resolvedConditionId,
      resolvedDepartmentId,
      resolvedLocationId,
      resolvedRoomId,
    });

    previewData.push({
      importStagingId: row.ImportStagingId,
      sourceRow: row.SourceRow,
      assetTag: row.AssetTag,
      categoryName: row.CategoryName,
      brandName: row.BrandName,
      modelName: row.ModelName,
      statusName: row.StatusName,
      conditionName: row.ConditionName,
      departmentName: row.DepartmentName,
      locationName: row.LocationName,
      roomName: row.RoomName,
      employeeCode: row.EmployeeCode,
      remarks: row.Remarks,
      importStatus,
      importMessage: message,
      duplicateTagStatus,
      changes,
    });
  }

  await repository.updateBatchStats({
    importBatchId,
    totalRows: stagingRows.length,
    validRows,
    invalidRows,
    importedRows: 0,
    updateRows,
    ignoredRows,
    status: "Validated",
  });

  return {
    success: true,
    batchId: importBatchId,
    totalRows: stagingRows.length,
    validRows,
    invalidRows,
    updateRows,
    ignoredRows,
    rows: previewData,
  };
};

const commitImport = async ({ importBatchId, userId }) => {
  return repository.commitValidStagingRows({
    importBatchId,
    importedBy: userId,
  });
};

const getImportHistory = async ({ page, limit }) => {
  return repository.getImportHistory({ page, limit });
};

module.exports = {
  uploadAndPreview,
  validateBatch,
  commitImport,
  getImportHistory,
};
