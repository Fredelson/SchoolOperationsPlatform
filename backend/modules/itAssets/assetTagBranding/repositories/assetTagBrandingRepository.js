const { poolPromise, sql } = require("../../../../database/connection");

async function getAssetTagBranding(type) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("type", sql.NVarChar(50), type || "rounded")
    .query(`
      SELECT
        b.BrandingId,
        b.SchoolId,
        b.PrimaryColor,
        b.SecondaryColor,
        b.AccentColor,
        b.LogoFileId,
        b.SmallLogoFileId,
        b.Website,
        b.SupportEmail,
        b.SupportPhone,
        b.IsActive,
        s.SchoolName,
        s.Website AS SchoolWebsite,
        s.SchoolCode
      FROM dbo.Branding b
      INNER JOIN dbo.Schools s ON b.SchoolId = s.SchoolId
      WHERE b.IsActive = 1
    `);

  const row = result.recordset?.[0];
  if (!row) {
    return {
      settings: {
        print: { labelDiameter: 190 },
        visibility: { showWebsiteQr: false },
      },
      organization: { school: { website: "" } },
    };
  }

  return {
    settings: {
      print: { labelDiameter: 190 },
      visibility: { showWebsiteQr: Boolean(row.Website) },
    },
    organization: {
      school: {
        name: row.SchoolName || "",
        code: row.SchoolCode || "",
        website: row.SchoolWebsite || row.Website || "",
        email: row.SupportEmail || "",
        phone: row.SupportPhone || "",
      },
    },
    branding: {
      brandingId: row.BrandingId,
      primaryColor: row.PrimaryColor,
      secondaryColor: row.SecondaryColor,
      accentColor: row.AccentColor,
      logoFileId: row.LogoFileId,
      smallLogoFileId: row.SmallLogoFileId,
      isActive: row.IsActive,
    },
  };
}

module.exports = { getAssetTagBranding };