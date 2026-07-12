// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Asset Tag Branding Constants
// ============================================================

const ASSET_TAG_BRANDING_TYPES = ["rounded", "rectangular"];

const ASSET_TAG_BRANDING_PERMISSIONS = {
  rounded: {
    view: "asset_tag_branding.rounded.view",
    manage: "asset_tag_branding.rounded.manage",
  },
  rectangular: {
    view: "asset_tag_branding.rectangular.view",
    manage: "asset_tag_branding.rectangular.manage",
  },
};

const ASSET_TAG_PRINTER_PERMISSIONS = {
  rounded: {
    view: "asset_tags.rounded.view",
    print: "asset_tags.rounded.print",
  },
  rectangular: {
    view: "asset_tags.rectangular.view",
    print: "asset_tags.rectangular.print",
  },
};

const ROUNDED_ASSET_TAG_DEFAULTS = {
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
};

const RECTANGULAR_ASSET_TAG_DEFAULTS = {
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
};

const ASSET_TAG_BRANDING_DEFAULTS = {
  rounded: ROUNDED_ASSET_TAG_DEFAULTS,
  rectangular: RECTANGULAR_ASSET_TAG_DEFAULTS,
};

function cloneDefaultSettings(type) {
  return JSON.parse(JSON.stringify(ASSET_TAG_BRANDING_DEFAULTS[type]));
}

module.exports = {
  ASSET_TAG_BRANDING_TYPES,
  ASSET_TAG_BRANDING_PERMISSIONS,
  ASSET_TAG_PRINTER_PERMISSIONS,
  ASSET_TAG_BRANDING_DEFAULTS,
  cloneDefaultSettings,
};
