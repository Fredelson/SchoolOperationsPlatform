const { poolPromise, sql } = require("../../../../database/connection");

const BRANDING_TYPES = new Set(["rounded", "rectangular"]);

const DEFAULT_SETTINGS = {
  rounded: {
    schoolTagline: "BEST VALUE BRITISH EDUCATION",
    departmentLabel: "IT DEPARTMENT",
    propertyLabel: "PROPERTY OF",
    establishedYear: "1975",
    websiteQrInstruction: "SCAN FOR SCHOOL WEBSITE",
    assetQrInstruction: "SCAN FOR ASSET INFORMATION",
    colors: {
      outerRing: "#061B3D",
      innerRing: "#006B3C",
      accent: "#E6A000",
      background: "#FFFFFF",
      mainText: "#061B3D",
      secondaryText: "#006B3C",
      border: "#061B3D",
      barcode: "#000000",
      qrForeground: "#000000",
      qrBackground: "#FFFFFF",
      propertyText: "#006B3C",
      assetCode: "#000000",
      departmentText: "#061B3D",
    },
    visibility: {
      showWebsite: true,
      showAddress: true,
      showEstablishedYear: true,
      showPropertyLabel: true,
      showSocialIcons: false,
      showSchoolLogo: true,
      showSchoolTagline: true,
      showWebsiteQr: true,
      showAssetQr: true,
      showBarcode: true,
    },
    print: {
      templateKey: "FULL_A4",
      pageSize: "A4",
      orientation: "portrait",
      labelDiameter: 190,
      marginTop: 12,
      marginBottom: 12,
      marginLeft: 10,
      marginRight: 10,
      horizontalOffset: 0,
      verticalOffset: 0,
      printScale: 1,
      rows: 1,
      columns: 1,
      gapHorizontal: 0,
      gapVertical: 0,
    },
    template: null,
  },
  rectangular: {
    contentLabel: "IT ASSET",
    propertyLabel: "PROPERTY OF",
    visibility: {
      showQrCode: true,
      showBarcode: true,
      showLogo: true,
      showBorder: true,
    },
    colors: {
      border: "#000000",
      mainText: "#000000",
      background: "#FFFFFF",
      accent: "#E6A000",
      barcode: "#000000",
      qrForeground: "#000000",
      qrBackground: "#FFFFFF",
    },
    print: {
      templateKey: "RECTANGULAR_A4_GRID",
      pageSize: "A4",
      orientation: "portrait",
      printScale: 1,
    },
  },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeType = (type) => {
  const normalizedType = String(type || "rounded").trim().toLowerCase();

  if (!BRANDING_TYPES.has(normalizedType)) {
    const error = new Error("Unsupported asset tag branding type.");
    error.statusCode = 400;
    throw error;
  }

  return normalizedType;
};

const mergeSettings = (defaults, savedSettings = {}) => ({
  ...defaults,
  ...savedSettings,
  colors: {
    ...(defaults.colors || {}),
    ...(savedSettings.colors || {}),
  },
  visibility: {
    ...(defaults.visibility || {}),
    ...(savedSettings.visibility || {}),
  },
  print: {
    ...(defaults.print || {}),
    ...(savedSettings.print || {}),
  },
});

const parseSettings = (value) => {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const getFilePath = (file) => {
  const normalizedPath = String(file.path || "").replaceAll("\\", "/");
  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
};

const getOrganization = async (pool) => {
  const result = await pool.request().query(`
    SELECT TOP 1
      s.SchoolId,
      s.SchoolName,
      s.SchoolCode,
      s.Website AS SchoolWebsite,
      s.Address AS SchoolAddress,
      b.BrandingId,
      b.PrimaryColor,
      b.SecondaryColor,
      b.AccentColor,
      b.LogoFileId,
      b.SmallLogoFileId,
      b.DarkLogoFileId,
      logo.FilePath AS LogoPath,
      smallLogo.FilePath AS SmallLogoPath,
      darkLogo.FilePath AS DarkLogoPath
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
    WHERE s.IsActive = 1
    ORDER BY s.SchoolId ASC;
  `);

  return result.recordset?.[0] || {};
};

const getStoredBranding = async (pool, type) => {
  const result = await pool
    .request()
    .input("BrandingType", sql.NVarChar(30), type)
    .query(`
      SELECT TOP 1
        AssetTagBrandingId,
        BrandingType,
        SettingsJson,
        IsActive,
        CreatedAt,
        UpdatedAt
      FROM dbo.AssetTagBranding
      WHERE BrandingType = @BrandingType
      ORDER BY AssetTagBrandingId DESC;
    `);

  return result.recordset?.[0] || null;
};

async function getAssetTagBranding(type) {
  const normalizedType = normalizeType(type);
  const pool = await poolPromise;
  const [storedBranding, organization] = await Promise.all([
    getStoredBranding(pool, normalizedType),
    getOrganization(pool),
  ]);
  const defaults = clone(DEFAULT_SETTINGS[normalizedType]);
  const settings = mergeSettings(
    defaults,
    parseSettings(storedBranding?.SettingsJson)
  );

  return {
    type: normalizedType,
    brandingId: storedBranding?.AssetTagBrandingId || null,
    settings,
    defaults,
    organization: {
      school: {
        schoolName: organization.SchoolName || "",
        SchoolName: organization.SchoolName || "",
        schoolCode: organization.SchoolCode || "",
        SchoolCode: organization.SchoolCode || "",
        website: organization.SchoolWebsite || "",
        Website: organization.SchoolWebsite || "",
        address: organization.SchoolAddress || "",
        Address: organization.SchoolAddress || "",
      },
      branding: {
        brandingId: organization.BrandingId || null,
        logoPath: organization.LogoPath || "",
        smallLogoPath: organization.SmallLogoPath || "",
        darkLogoPath: organization.DarkLogoPath || "",
        primaryColor: organization.PrimaryColor || "",
        secondaryColor: organization.SecondaryColor || "",
        accentColor: organization.AccentColor || "",
      },
    },
  };
}

async function saveAssetTagBranding({ type, settings, userId }) {
  const normalizedType = normalizeType(type);
  const pool = await poolPromise;
  const mergedSettings = mergeSettings(
    clone(DEFAULT_SETTINGS[normalizedType]),
    settings || {}
  );
  const settingsJson = JSON.stringify(mergedSettings);

  await pool
    .request()
    .input("BrandingType", sql.NVarChar(30), normalizedType)
    .input("SettingsJson", sql.NVarChar(sql.MAX), settingsJson)
    .input("UpdatedBy", sql.Int, userId || null)
    .query(`
      MERGE dbo.AssetTagBranding AS target
      USING (SELECT @BrandingType AS BrandingType) AS source
        ON target.BrandingType = source.BrandingType
      WHEN MATCHED THEN
        UPDATE SET
          SettingsJson = @SettingsJson,
          IsActive = 1,
          UpdatedBy = @UpdatedBy,
          UpdatedAt = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (
          BrandingType,
          SettingsJson,
          IsActive,
          CreatedBy,
          CreatedAt
        )
        VALUES (
          @BrandingType,
          @SettingsJson,
          1,
          @UpdatedBy,
          GETDATE()
        );
    `);

  return getAssetTagBranding(normalizedType);
}

async function insertTemplateFile({ file, assetTagBrandingId, userId }) {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("OriginalFileName", sql.NVarChar(255), file.originalname)
    .input("StoredFileName", sql.NVarChar(255), file.filename)
    .input("FilePath", sql.NVarChar(sql.MAX), getFilePath(file))
    .input("FileType", sql.NVarChar(100), file.mimetype)
    .input("FileSizeKB", sql.Decimal(18, 2), Number((file.size / 1024).toFixed(2)))
    .input("EntityType", sql.NVarChar(100), "AssetTagBranding")
    .input("EntityId", sql.Int, assetTagBrandingId)
    .input("UploadedBy", sql.Int, userId || null)
    .query(`
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
      OUTPUT INSERTED.FileId AS FileId
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
    `);

  return result.recordset?.[0]?.FileId || null;
}

module.exports = {
  DEFAULT_SETTINGS,
  getAssetTagBranding,
  insertTemplateFile,
  normalizeType,
  saveAssetTagBranding,
};
