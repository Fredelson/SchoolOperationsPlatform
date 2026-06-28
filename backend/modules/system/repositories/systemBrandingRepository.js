// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// System Branding Repository
// ============================================
//
// Purpose:
// Handles SQL queries for school profile,
// branding, and branding media files.
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

const updateSchoolProfile = async (schoolId, data) => {
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
    {
      SchoolId: { type: sql.Int, value: schoolId },
      SchoolName: { type: sql.NVarChar(255), value: data.schoolName },
      Address: { type: sql.NVarChar(sql.MAX), value: data.address || null },
      Phone: { type: sql.NVarChar(100), value: data.phone || null },
      Email: { type: sql.NVarChar(255), value: data.email || null },
      Website: { type: sql.NVarChar(255), value: data.website || null },
      TimeZone: {
        type: sql.NVarChar(100),
        value: data.timeZone || "Asia/Dubai",
      },
      CurrencyCode: {
        type: sql.NVarChar(10),
        value: data.currencyCode || "AED",
      },
    }
  );
};

// ============================================================
// UPSERT BRANDING
// ============================================================

const upsertBranding = async (schoolId, data, updatedBy) => {
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
        LoginTitle = @LoginTitle,
        LoginSubtitle = @LoginSubtitle,
        FooterText = @FooterText,
        Website = @Website,
        SupportEmail = @SupportEmail,
        SupportPhone = @SupportPhone,
        UpdatedBy = @UpdatedBy,
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
    {
      SchoolId: { type: sql.Int, value: schoolId },
      PrimaryColor: {
        type: sql.NVarChar(20),
        value: data.primaryColor || "#0B3D2E",
      },
      SecondaryColor: {
        type: sql.NVarChar(20),
        value: data.secondaryColor || "#12324A",
      },
      AccentColor: {
        type: sql.NVarChar(20),
        value: data.accentColor || "#C9A227",
      },
      SidebarColor: {
        type: sql.NVarChar(20),
        value: data.sidebarColor || "#0B2239",
      },
      TopbarColor: {
        type: sql.NVarChar(20),
        value: data.topbarColor || "#FFFFFF",
      },
      LoginCardColor: {
        type: sql.NVarChar(20),
        value: data.loginCardColor || "#FFFFFF",
      },
      LoginTitle: { type: sql.NVarChar(255), value: data.loginTitle || null },
      LoginSubtitle: {
        type: sql.NVarChar(255),
        value: data.loginSubtitle || null,
      },
      FooterText: { type: sql.NVarChar(500), value: data.footerText || null },
      Website: { type: sql.NVarChar(255), value: data.website || null },
      SupportEmail: {
        type: sql.NVarChar(255),
        value: data.supportEmail || null,
      },
      SupportPhone: {
        type: sql.NVarChar(100),
        value: data.supportPhone || null,
      },
      UpdatedBy: { type: sql.Int, value: updatedBy || null },
    }
  );
};

// ============================================================
// INSERT FILE STORAGE RECORD
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

    SELECT SCOPE_IDENTITY() AS InsertedId;
    `,
    {
      OriginalFileName: {
        type: sql.NVarChar(255),
        value: file.originalname,
      },
      StoredFileName: {
        type: sql.NVarChar(255),
        value: file.filename,
      },
      FilePath: {
        type: sql.NVarChar(sql.MAX),
        value: file.path,
      },
      FileType: {
        type: sql.NVarChar(100),
        value: file.mimetype,
      },
      FileSizeKB: {
        type: sql.Decimal(18, 2),
        value: Number((file.size / 1024).toFixed(2)),
      },
      EntityType: {
        type: sql.NVarChar(100),
        value: entityType,
      },
      EntityId: {
        type: sql.Int,
        value: entityId || null,
      },
      UploadedBy: {
        type: sql.Int,
        value: uploadedBy || null,
      },
    }
  );

  return insertedId(result);
};

// ============================================================
// UPDATE BRANDING FILE REFERENCE
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
  }

  await executeQuery(
    `
    MERGE dbo.Branding AS target
    USING (SELECT @SchoolId AS SchoolId) AS source
      ON target.SchoolId = source.SchoolId

    WHEN MATCHED THEN
      UPDATE SET
        ${columnName} = @FileId,
        UpdatedBy = @UpdatedBy,
        UpdatedAt = GETDATE(),
        IsActive = 1

    WHEN NOT MATCHED THEN
      INSERT (
        SchoolId,
        ${columnName},
        UpdatedBy,
        CreatedAt,
        IsActive
      )
      VALUES (
        @SchoolId,
        @FileId,
        @UpdatedBy,
        GETDATE(),
        1
      );
    `,
    {
      SchoolId: { type: sql.Int, value: schoolId },
      FileId: { type: sql.Int, value: fileId },
      UpdatedBy: { type: sql.Int, value: updatedBy || null },
    }
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