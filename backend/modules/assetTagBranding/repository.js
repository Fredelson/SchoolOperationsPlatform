// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Asset Tag Branding Repository
// ============================================================

const {
  sql,
  executeQuery,
  firstOrNull,
} = require("../../shared/database");

async function getByType(type) {
  const result = await executeQuery(
    `
      SELECT TOP 1
        AssetTagBrandingId,
        BrandingType,
        SettingsJson,
        IsActive,
        CreatedBy,
        UpdatedBy,
        CreatedAt,
        UpdatedAt
      FROM dbo.AssetTagBranding
      WHERE BrandingType = @BrandingType
        AND IsActive = 1;
    `,
    [
      {
        name: "BrandingType",
        type: sql.NVarChar(30),
        value: type,
      },
    ]
  );

  return firstOrNull(result);
}

async function upsert(type, settingsJson, userId) {
  await executeQuery(
    `
      MERGE dbo.AssetTagBranding AS target
      USING (SELECT @BrandingType AS BrandingType) AS source
        ON target.BrandingType = source.BrandingType

      WHEN MATCHED THEN
        UPDATE SET
          SettingsJson = @SettingsJson,
          IsActive = 1,
          UpdatedBy = @UserId,
          UpdatedAt = GETDATE()

      WHEN NOT MATCHED THEN
        INSERT (
          BrandingType,
          SettingsJson,
          IsActive,
          CreatedBy,
          UpdatedBy,
          CreatedAt,
          UpdatedAt
        )
        VALUES (
          @BrandingType,
          @SettingsJson,
          1,
          @UserId,
          @UserId,
          GETDATE(),
          GETDATE()
        );
    `,
    [
      {
        name: "BrandingType",
        type: sql.NVarChar(30),
        value: type,
      },
      {
        name: "SettingsJson",
        type: sql.NVarChar(sql.MAX),
        value: settingsJson,
      },
      {
        name: "UserId",
        type: sql.Int,
        value: userId || null,
      },
    ]
  );

  return getByType(type);
}

module.exports = {
  getByType,
  upsert,
};
