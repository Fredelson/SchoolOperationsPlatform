const { poolPromise, sql } = require("../../../config/db");

const SETTING_DEFINITIONS = Object.freeze({
  approvalThresholdSheets: {
    key: "printing.approval.threshold_sheets",
    type: "number",
    defaultValue: 500,
    minimum: 1,
  },
  requireHodApproval: {
    key: "printing.require_hod_approval",
    type: "boolean",
    defaultValue: true,
  },
  hodSelfApproval: {
    key: "printing.hod_self_approval",
    type: "boolean",
    defaultValue: false,
  },
  queueAssignmentMode: {
    key: "printing.queue.assignment_mode",
    type: "enum",
    values: ["shared", "direct"],
    defaultValue: "shared",
  },
  allowReturn: {
    key: "printing.request.allow_return",
    type: "boolean",
    defaultValue: true,
  },
  allowCancelBeforePrinting: {
    key: "printing.request.allow_cancel_before_printing",
    type: "boolean",
    defaultValue: true,
  },
  bundleSheets: {
    key: "printing.inventory.bundle_sheets",
    type: "number",
    defaultValue: 500,
    minimum: 1,
  },
  bundlesPerBox: {
    key: "printing.inventory.bundles_per_box",
    type: "number",
    defaultValue: 5,
    minimum: 1,
  },
  lowStockA4: {
    key: "printing.inventory.low_stock_a4",
    type: "number",
    defaultValue: 3000,
    minimum: 0,
  },
  lowStockA3: {
    key: "printing.inventory.low_stock_a3",
    type: "number",
    defaultValue: 1500,
    minimum: 0,
  },
  uploadMaxMb: {
    key: "printing.upload.max_mb",
    type: "number",
    defaultValue: 20,
    minimum: 1,
  },
  allowedExtensions: {
    key: "printing.upload.allowed_extensions",
    type: "list",
    defaultValue: ["pdf", "docx", "pptx", "jpg", "jpeg", "png"],
  },
});

const parseValue = (definition, rawValue) => {
  if (rawValue === null || rawValue === undefined) {
    return definition.defaultValue;
  }

  switch (definition.type) {
    case "number": {
      const value = Number(rawValue);
      return Number.isFinite(value) ? value : definition.defaultValue;
    }
    case "boolean":
      return ["true", "1", "yes", "on"].includes(
        String(rawValue).trim().toLowerCase()
      );
    case "list":
      return String(rawValue)
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
    default:
      return String(rawValue);
  }
};

const serializeValue = (definition, value) => {
  if (definition.type === "number") {
    const numericValue = Number(value);

    if (
      !Number.isFinite(numericValue) ||
      numericValue < (definition.minimum ?? Number.NEGATIVE_INFINITY)
    ) {
      const error = new Error(`Invalid value for ${definition.key}.`);
      error.statusCode = 400;
      throw error;
    }

    return String(Math.trunc(numericValue));
  }

  if (definition.type === "boolean") {
    return value === true || String(value).toLowerCase() === "true"
      ? "true"
      : "false";
  }

  if (definition.type === "list") {
    const values = Array.isArray(value) ? value : String(value || "").split(",");
    return values
      .map((item) => String(item).trim().toLowerCase().replace(/^\./, ""))
      .filter(Boolean)
      .join(",");
  }

  if (definition.type === "enum") {
    const normalizedValue = String(value || "").trim().toLowerCase();

    if (!definition.values.includes(normalizedValue)) {
      const error = new Error(`Invalid value for ${definition.key}.`);
      error.statusCode = 400;
      throw error;
    }

    return normalizedValue;
  }

  return String(value ?? "");
};

const getSettings = async (schoolId = 1) => {
  const pool = await poolPromise;
  const keys = Object.values(SETTING_DEFINITIONS).map(
    (definition) => definition.key
  );
  const result = await pool
    .request()
    .input("SchoolId", sql.Int, Number(schoolId || 1))
    .input("KeysJson", sql.NVarChar, JSON.stringify(keys))
    .query(`
      SELECT
        requested.[value] AS SettingKey,
        COALESCE(schoolSetting.SettingValue, systemSetting.SettingValue) AS SettingValue
      FROM OPENJSON(@KeysJson) requested
      LEFT JOIN dbo.SchoolSettings schoolSetting
        ON schoolSetting.SchoolId = @SchoolId
       AND schoolSetting.SettingKey = requested.[value]
      LEFT JOIN dbo.SystemSettings systemSetting
        ON systemSetting.SettingKey = requested.[value];
    `);

  const values = new Map(
    result.recordset.map((row) => [row.SettingKey, row.SettingValue])
  );

  return Object.fromEntries(
    Object.entries(SETTING_DEFINITIONS).map(([name, definition]) => [
      name,
      parseValue(definition, values.get(definition.key)),
    ])
  );
};

const updateSettings = async (schoolId, payload) => {
  const entries = Object.entries(payload || {}).filter(
    ([name]) => SETTING_DEFINITIONS[name]
  );

  if (!entries.length) {
    const error = new Error("No supported printing settings were provided.");
    error.statusCode = 400;
    throw error;
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    for (const [name, value] of entries) {
      const definition = SETTING_DEFINITIONS[name];
      const serializedValue = serializeValue(definition, value);

      await new sql.Request(transaction)
        .input("SchoolId", sql.Int, Number(schoolId || 1))
        .input("SettingKey", sql.NVarChar(150), definition.key)
        .input("SettingValue", sql.NVarChar(sql.MAX), serializedValue)
        .query(`
          MERGE dbo.SchoolSettings AS target
          USING (
            SELECT
              @SchoolId AS SchoolId,
              @SettingKey AS SettingKey
          ) AS source
          ON target.SchoolId = source.SchoolId
          AND target.SettingKey = source.SettingKey
          WHEN MATCHED THEN
            UPDATE SET
              SettingValue = @SettingValue,
              SettingGroup = 'Printing',
              IsEditable = 1,
              UpdatedAt = GETDATE()
          WHEN NOT MATCHED THEN
            INSERT (
              SchoolId,
              SettingKey,
              SettingValue,
              SettingGroup,
              IsEditable,
              UpdatedAt
            )
            VALUES (
              @SchoolId,
              @SettingKey,
              @SettingValue,
              'Printing',
              1,
              GETDATE()
            );
        `);
    }

    await transaction.commit();
    return getSettings(schoolId);
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // The original error is more useful to the caller.
    }
    throw error;
  }
};

module.exports = {
  SETTING_DEFINITIONS,
  getSettings,
  updateSettings,
};
