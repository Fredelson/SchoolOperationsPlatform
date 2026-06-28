// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// System Branding Repository
// ============================================
//
// Purpose:
// Handles SQL operations for school profile,
// branding colors, background engine settings,
// and branding media files.
//
// Rules:
// - SQL only
// - No business logic
// - No HTTP logic
// ============================================

const {
  sql,
  executeQuery,
  firstOrNull,
  insertedId,
} = require("../../../shared/database");

// ============================================================
// GET ACTIVE SCHOOL BRANDING
// ============================================================
//
// Purpose:
// Loads the active school profile together with
// branding colors, background settings, and branding media paths.
// ============================================================

const getActiveSchoolBranding = async () => {
  const result = await executeQuery(`
    SELECT TOP 1
      s.SchoolId,
      s.SchoolCode,
      s.SchoolName,
      s.LogoFileId AS SchoolLogoFileId,
      s.Address,
      s.Phone,
      s.Email,
      s.Website,
      s.TimeZone,
      s.CurrencyCode,

      b.BrandingId,
      b.LogoFileId,
      b.SmallLogoFileId,
      b.DarkLogoFileId,
      b.FaviconFileId,
      b.LoginBackgroundFileId,

      b.PrimaryColor,
      b.SecondaryColor,
      b.AccentColor,
      b.SidebarColor,
      b.TopbarColor,
      b.LoginCardColor,

      b.SidebarBackgroundType,
      b.SidebarGradientStart,
      b.SidebarGradientMiddle,
      b.SidebarGradientEnd,
      b.SidebarGradientDirection,
      b.SidebarGradientPosition,

      b.TopbarBackgroundType,
      b.TopbarGradientStart,
      b.TopbarGradientMiddle,
      b.TopbarGradientEnd,
      b.TopbarGradientDirection,
      b.TopbarGradientPosition,

      b.LoginTitle,
      b.LoginSubtitle,
      b.FooterText,
      b.SupportEmail,
      b.SupportPhone,

      logo.FilePath AS LogoPath,
      smallLogo.FilePath AS SmallLogoPath,
      darkLogo.FilePath AS DarkLogoPath,
      favicon.FilePath AS FaviconPath,
      loginBg.FilePath AS LoginBackgroundPath

    FROM dbo.Schools s
    LEFT JOIN dbo.Branding b
      ON b.SchoolId = s.SchoolId
     AND b.IsActive = 1

    LEFT JOIN dbo.FileStorage logo
      ON logo.FileId = b.LogoFileId
     AND logo.IsDeleted = 0

    LEFT JOIN dbo.FileStorage smallLogo
      ON smallLogo.FileId = b.SmallLogoFileId
     AND smallLogo.IsDeleted = 0

    LEFT JOIN dbo.FileStorage darkLogo
      ON darkLogo.FileId = b.DarkLogoFileId
     AND darkLogo.IsDeleted = 0

    LEFT JOIN dbo.FileStorage favicon
      ON favicon.FileId = b.FaviconFileId
     AND favicon.IsDeleted = 0

    LEFT JOIN dbo.FileStorage loginBg
      ON loginBg.FileId = b.LoginBackgroundFileId
     AND loginBg.IsDeleted = 0

    WHERE s.IsActive = 1
    ORDER BY s.SchoolId ASC;
  `);

  return firstOrNull(result);
};

// ============================================================
// UPDATE SCHOOL PROFILE
// ============================================================

const updateSchoolProfile = async (schoolId, data = {}) => {
  await executeQuery(
    `
      UPDATE dbo.Schools
      SET
        SchoolName = @SchoolName,
        Address = @Address,
        Phone = @Phone,
        Email = @Email,
        Website = @Website,
        TimeZone = @TimeZone,
        CurrencyCode = @CurrencyCode,
        UpdatedAt = GETDATE()
      WHERE SchoolId = @SchoolId
        AND IsActive = 1;
    `,
    [
      { name: "SchoolId", type: sql.Int, value: schoolId },
      { name: "SchoolName", type: sql.NVarChar(255), value: data.schoolName },
      { name: "Address", type: sql.NVarChar(sql.MAX), value: data.address || null },
      { name: "Phone", type: sql.NVarChar(100), value: data.phone || null },
      { name: "Email", type: sql.NVarChar(255), value: data.email || null },
      { name: "Website", type: sql.NVarChar(255), value: data.website || null },
      { name: "TimeZone", type: sql.NVarChar(100), value: data.timeZone || "Asia/Dubai" },
      { name: "CurrencyCode", type: sql.NVarChar(10), value: data.currencyCode || "AED" },
    ]
  );
};

// ============================================================
// UPSERT BRANDING SETTINGS
// ============================================================

const upsertBranding = async (schoolId, data = {}, updatedBy) => {
  await executeQuery(
    `
      MERGE dbo.Branding AS target
      USING (SELECT @SchoolId AS SchoolId) AS source
        ON target.SchoolId = source.SchoolId

      WHEN MATCHED THEN
        UPDATE SET
          PrimaryColor = @PrimaryColor,
          SecondaryColor = @SecondaryColor,
          AccentColor = @AccentColor,
          SidebarColor = @SidebarColor,
          TopbarColor = @TopbarColor,
          LoginCardColor = @LoginCardColor,

          SidebarBackgroundType = @SidebarBackgroundType,
          SidebarGradientStart = @SidebarGradientStart,
          SidebarGradientMiddle = @SidebarGradientMiddle,
          SidebarGradientEnd = @SidebarGradientEnd,
          SidebarGradientDirection = @SidebarGradientDirection,
          SidebarGradientPosition = @SidebarGradientPosition,

          TopbarBackgroundType = @TopbarBackgroundType,
          TopbarGradientStart = @TopbarGradientStart,
          TopbarGradientMiddle = @TopbarGradientMiddle,
          TopbarGradientEnd = @TopbarGradientEnd,
          TopbarGradientDirection = @TopbarGradientDirection,
          TopbarGradientPosition = @TopbarGradientPosition,

          LoginTitle = @LoginTitle,
          LoginSubtitle = @LoginSubtitle,
          FooterText = @FooterText,
          Website = @Website,
          SupportEmail = @SupportEmail,
          SupportPhone = @SupportPhone,
          UpdatedBy = COALESCE(@UpdatedBy, UpdatedBy),
          UpdatedAt = GETDATE(),
          IsActive = 1

      WHEN NOT MATCHED THEN
        INSERT (
          SchoolId,
          PrimaryColor,
          SecondaryColor,
          AccentColor,
          SidebarColor,
          TopbarColor,
          LoginCardColor,
          SidebarBackgroundType,
          SidebarGradientStart,
          SidebarGradientMiddle,
          SidebarGradientEnd,
          SidebarGradientDirection,
          SidebarGradientPosition,
          TopbarBackgroundType,
          TopbarGradientStart,
          TopbarGradientMiddle,
          TopbarGradientEnd,
          TopbarGradientDirection,
          TopbarGradientPosition,
          LoginTitle,
          LoginSubtitle,
          FooterText,
          Website,
          SupportEmail,
          SupportPhone,
          UpdatedBy,
          CreatedAt,
          IsActive
        )
        VALUES (
          @SchoolId,
          @PrimaryColor,
          @SecondaryColor,
          @AccentColor,
          @SidebarColor,
          @TopbarColor,
          @LoginCardColor,
          @SidebarBackgroundType,
          @SidebarGradientStart,
          @SidebarGradientMiddle,
          @SidebarGradientEnd,
          @SidebarGradientDirection,
          @SidebarGradientPosition,
          @TopbarBackgroundType,
          @TopbarGradientStart,
          @TopbarGradientMiddle,
          @TopbarGradientEnd,
          @TopbarGradientDirection,
          @TopbarGradientPosition,
          @LoginTitle,
          @LoginSubtitle,
          @FooterText,
          @Website,
          @SupportEmail,
          @SupportPhone,
          @UpdatedBy,
          GETDATE(),
          1
        );
    `,
    [
      { name: "SchoolId", type: sql.Int, value: schoolId },
      { name: "PrimaryColor", type: sql.NVarChar(20), value: data.primaryColor || "#1E3A8A" },
      { name: "SecondaryColor", type: sql.NVarChar(20), value: data.secondaryColor || "#2563EB" },
      { name: "AccentColor", type: sql.NVarChar(20), value: data.accentColor || "#16A34A" },
      { name: "SidebarColor", type: sql.NVarChar(20), value: data.sidebarColor || "#061B52" },
      { name: "TopbarColor", type: sql.NVarChar(20), value: data.topbarColor || "#071B4D" },
      { name: "LoginCardColor", type: sql.NVarChar(20), value: data.loginCardColor || "#FFFFFF" },
      { name: "SidebarBackgroundType", type: sql.NVarChar(30), value: data.sidebarBackgroundType || "solid" },
      { name: "SidebarGradientStart", type: sql.NVarChar(20), value: data.sidebarGradientStart || null },
      { name: "SidebarGradientMiddle", type: sql.NVarChar(20), value: data.sidebarGradientMiddle || null },
      { name: "SidebarGradientEnd", type: sql.NVarChar(20), value: data.sidebarGradientEnd || null },
      { name: "SidebarGradientDirection", type: sql.NVarChar(30), value: data.sidebarGradientDirection || "180deg" },
      { name: "SidebarGradientPosition", type: sql.NVarChar(50), value: data.sidebarGradientPosition || "center" },
      { name: "TopbarBackgroundType", type: sql.NVarChar(30), value: data.topbarBackgroundType || "solid" },
      { name: "TopbarGradientStart", type: sql.NVarChar(20), value: data.topbarGradientStart || null },
      { name: "TopbarGradientMiddle", type: sql.NVarChar(20), value: data.topbarGradientMiddle || null },
      { name: "TopbarGradientEnd", type: sql.NVarChar(20), value: data.topbarGradientEnd || null },
      { name: "TopbarGradientDirection", type: sql.NVarChar(30), value: data.topbarGradientDirection || "90deg" },
      { name: "TopbarGradientPosition", type: sql.NVarChar(50), value: data.topbarGradientPosition || "center" },
      { name: "LoginTitle", type: sql.NVarChar(255), value: data.loginTitle || null },
      { name: "LoginSubtitle", type: sql.NVarChar(255), value: data.loginSubtitle || null },
      { name: "FooterText", type: sql.NVarChar(500), value: data.footerText || null },
      { name: "Website", type: sql.NVarChar(255), value: data.website || null },
      { name: "SupportEmail", type: sql.NVarChar(255), value: data.supportEmail || null },
      { name: "SupportPhone", type: sql.NVarChar(100), value: data.supportPhone || null },
      { name: "UpdatedBy", type: sql.Int, value: updatedBy || null },
    ]
  );
};

// ============================================================
// INSERT FILE STORAGE RECORD
// ============================================================

// ============================================================
// INSERT FILE STORAGE RECORD
// ============================================================
//
// Purpose:
// Saves uploaded branding media into FileStorage and returns
// the exact FileId generated by SQL Server.
//
// Why OUTPUT INSERTED.FileId is used:
// It is more reliable than SCOPE_IDENTITY() with helper wrappers
// because it returns the inserted FileId directly as a result row.
// ============================================================

const insertFileStorage = async ({ file, entityType, entityId, uploadedBy }) => {
  const result = await executeQuery(
    `
      INSERT INTO dbo.FileStorage (
        OriginalFileName,
        StoredFileName,
        FilePath,
        FileType,
        FileSizeKB,
        EntityType,
        EntityId,
        UploadedBy,
        UploadedAt,
        IsDeleted
      )
      OUTPUT INSERTED.FileId AS InsertedId
      VALUES (
        @OriginalFileName,
        @StoredFileName,
        @FilePath,
        @FileType,
        @FileSizeKB,
        @EntityType,
        @EntityId,
        @UploadedBy,
        GETDATE(),
        0
      );
    `,
    [
      { name: "OriginalFileName", type: sql.NVarChar(255), value: file.originalname },
      { name: "StoredFileName", type: sql.NVarChar(255), value: file.filename },
      {name: "FilePath", type: sql.NVarChar(sql.MAX), value: `/${file.path.replaceAll("\\", "/")}`,},
      { name: "FileType", type: sql.NVarChar(100), value: file.mimetype },
      {name: "FileSizeKB", type: sql.Decimal(18, 2), value: Number((file.size / 1024).toFixed(2)),},
      { name: "EntityType", type: sql.NVarChar(100), value: entityType },
      { name: "EntityId", type: sql.Int, value: entityId || null },
      { name: "UploadedBy", type: sql.Int, value: uploadedBy || null },
    ]
  );

  const insertedFile = firstOrNull(result);

  if (!insertedFile?.InsertedId) {
    throw new Error("File uploaded but FileStorage FileId was not returned.");
  }

  return Number(insertedFile.InsertedId);
};
// ============================================================
// UPDATE BRANDING FILE REFERENCE
// ============================================================
//
// Purpose:
// Updates the Branding table after branding media
// has been saved in FileStorage.
//
// Security:
// Column names cannot be SQL parameters, so we strictly
// whitelist allowed branding media columns before injecting
// the column name into the SQL statement.
// ============================================================

const updateBrandingFile = async (schoolId, columnName, fileId, updatedBy) => {
  const allowedColumns = [
    "LogoFileId",
    "SmallLogoFileId",
    "DarkLogoFileId",
    "FaviconFileId",
    "LoginBackgroundFileId",
  ];

  if (!allowedColumns.includes(columnName)) {
    throw new Error("Invalid branding file column.");
  if (!fileId) {
  throw new Error("Cannot update branding file because FileId is missing.");
}
  }

  await executeQuery(
    `
      UPDATE dbo.Branding
      SET
        ${columnName} = @FileId,
        UpdatedBy = COALESCE(@UpdatedBy, UpdatedBy),
        UpdatedAt = GETDATE(),
        IsActive = 1
      WHERE SchoolId = @SchoolId;

      IF @@ROWCOUNT = 0
      BEGIN
        INSERT INTO dbo.Branding (
          SchoolId,
          ${columnName},
          CreatedAt,
          IsActive
        )
        VALUES (
          @SchoolId,
          @FileId,
          GETDATE(),
          1
        );
      END;
    `,
    [
      { name: "SchoolId", type: sql.Int, value: schoolId },
      { name: "FileId", type: sql.Int, value: fileId },
      { name: "UpdatedBy", type: sql.Int, value: updatedBy || null },
    ]
  );
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getActiveSchoolBranding,
  updateSchoolProfile,
  upsertBranding,
  insertFileStorage,
  updateBrandingFile,
};